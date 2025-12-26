<?php
/**
 * Database Configuration for Firebase Firestore REST API
 */

class FirebaseDatabase {
    private $projectId;
    private $firestoreURL;
    private $accessToken;
    
    public function __construct() {
        $this->projectId = "sendly-2702c";
        $this->firestoreURL = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents";
        $this->accessToken = $this->getAccessToken();
    }
    
    /**
     * Get access token from service account
     */
    private function getAccessToken() {
        $serviceAccountPath = __DIR__ . '/firebase-service-account.json';
        
        if (!file_exists($serviceAccountPath)) {
            error_log("Service account file not found: " . $serviceAccountPath);
            return null;
        }
        
        $serviceAccount = json_decode(file_get_contents($serviceAccountPath), true);
        
        if (!$serviceAccount) {
            error_log("Invalid service account JSON");
            return null;
        }
        
        // Create JWT
        $header = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
        $now = time();
        $payload = json_encode([
            'iss' => $serviceAccount['client_email'],
            'scope' => 'https://www.googleapis.com/auth/datastore',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now
        ]);
        
        // Base64url encode header and payload
        $headerEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $payloadEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        // Create signature
        $privateKey = $serviceAccount['private_key'];
        $signature = '';
        openssl_sign($headerEncoded . "." . $payloadEncoded, $signature, $privateKey, 'SHA256');
        $signatureEncoded = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        $jwt = $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
        
        // Exchange JWT for access token
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            return $data['access_token'] ?? null;
        }
        
        error_log("Failed to get access token: " . $response);
        return null;
    }
    
    /**
     * Convert PHP data to Firestore format
     */
    private function toFirestoreValue($value) {
        if (is_null($value)) {
            return ['nullValue' => null];
        } elseif (is_bool($value)) {
            return ['booleanValue' => $value];
        } elseif (is_int($value)) {
            return ['integerValue' => (string)$value];
        } elseif (is_float($value)) {
            return ['doubleValue' => $value];
        } elseif (is_string($value)) {
            return ['stringValue' => $value];
        } elseif (is_array($value)) {
            // Check if associative array (map) or indexed array
            if (array_keys($value) !== range(0, count($value) - 1)) {
                $fields = [];
                foreach ($value as $k => $v) {
                    $fields[$k] = $this->toFirestoreValue($v);
                }
                return ['mapValue' => ['fields' => $fields]];
            } else {
                $values = [];
                foreach ($value as $v) {
                    $values[] = $this->toFirestoreValue($v);
                }
                return ['arrayValue' => ['values' => $values]];
            }
        }
        return ['stringValue' => (string)$value];
    }
    
    /**
     * Convert Firestore format to PHP data
     */
    private function fromFirestoreValue($value) {
        if (isset($value['nullValue'])) {
            return null;
        } elseif (isset($value['booleanValue'])) {
            return $value['booleanValue'];
        } elseif (isset($value['integerValue'])) {
            return (int)$value['integerValue'];
        } elseif (isset($value['doubleValue'])) {
            return (float)$value['doubleValue'];
        } elseif (isset($value['stringValue'])) {
            return $value['stringValue'];
        } elseif (isset($value['timestampValue'])) {
            return $value['timestampValue'];
        } elseif (isset($value['mapValue'])) {
            $result = [];
            if (isset($value['mapValue']['fields'])) {
                foreach ($value['mapValue']['fields'] as $k => $v) {
                    $result[$k] = $this->fromFirestoreValue($v);
                }
            }
            return $result;
        } elseif (isset($value['arrayValue'])) {
            $result = [];
            if (isset($value['arrayValue']['values'])) {
                foreach ($value['arrayValue']['values'] as $v) {
                    $result[] = $this->fromFirestoreValue($v);
                }
            }
            return $result;
        }
        return null;
    }
    
    /**
     * Convert Firestore document to PHP array
     */
    private function fromFirestoreDocument($doc) {
        if (!$doc || !isset($doc['fields'])) {
            return null;
        }
        
        $result = [];
        foreach ($doc['fields'] as $key => $value) {
            $result[$key] = $this->fromFirestoreValue($value);
        }
        return $result;
    }
    
    /**
     * Get data from Firestore
     * Path format: "collection/docId" or "collection/docId/subcollection/subDocId"
     */
    public function get($path) {
        $url = $this->firestoreURL . '/' . $path;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        if ($this->accessToken) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $this->accessToken,
                'Content-Type: application/json'
            ]);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log("GET request failed: HTTP $httpCode, URL: $url, Response: $response");
            return null;
        }
        
        $data = json_decode($response, true);
        
        // Check if it's a collection (has 'documents' key)
        if (isset($data['documents'])) {
            $result = [];
            foreach ($data['documents'] as $doc) {
                // Extract document ID from name
                $nameParts = explode('/', $doc['name']);
                $docId = end($nameParts);
                $result[$docId] = $this->fromFirestoreDocument($doc);
            }
            return $result;
        }
        
        // Single document
        return $this->fromFirestoreDocument($data);
    }
    
    /**
     * Create/Set document in Firestore (full replace)
     */
    public function set($path, $data) {
        $url = $this->firestoreURL . '/' . $path;
        
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[$key] = $this->toFirestoreValue($value);
        }
        
        $body = json_encode(['fields' => $fields]);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return $httpCode === 200;
    }
    
    /**
     * Update document in Firestore (partial update)
     */
    public function update($path, $data) {
        // Build update mask
        $updateMask = implode('&', array_map(function($key) {
            return 'updateMask.fieldPaths=' . urlencode($key);
        }, array_keys($data)));
        
        $url = $this->firestoreURL . '/' . $path . '?' . $updateMask;
        
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[$key] = $this->toFirestoreValue($value);
        }
        
        $body = json_encode(['fields' => $fields]);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $headers = ['Content-Type: application/json'];
        if ($this->accessToken) {
            $headers[] = 'Authorization: Bearer ' . $this->accessToken;
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log("UPDATE request failed: HTTP $httpCode, URL: $url, Response: $response");
        }
        
        return $httpCode === 200;
    }
    
    /**
     * Push data (create new document with auto-generated ID)
     */
    public function push($collectionPath, $data) {
        $url = $this->firestoreURL . '/' . $collectionPath;
        
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[$key] = $this->toFirestoreValue($value);
        }
        
        $body = json_encode(['fields' => $fields]);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $headers = ['Content-Type: application/json'];
        if ($this->accessToken) {
            $headers[] = 'Authorization: Bearer ' . $this->accessToken;
        }
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $result = json_decode($response, true);
            // Extract document ID from name
            $nameParts = explode('/', $result['name']);
            return ['name' => end($nameParts)];
        }
        
        error_log("PUSH request failed: HTTP $httpCode, URL: $url, Response: $response");
        return null;
    }
    
    /**
     * Delete document
     */
    public function delete($path) {
        $url = $this->firestoreURL . '/' . $path;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $headers = [];
        if ($this->accessToken) {
            $headers[] = 'Authorization: Bearer ' . $this->accessToken;
        }
        if (!empty($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log("DELETE request failed: HTTP $httpCode, URL: $url, Response: $response");
        }
        
        return $httpCode === 200;
    }
}
