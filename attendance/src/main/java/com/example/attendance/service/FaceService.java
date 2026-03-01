package com.example.attendance.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.attendance.entity.Employee;
import com.example.attendance.entity.FaceEmbedding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class FaceService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String aiServiceUrl;

    public FaceService(@Value("${ai.service.url:http://localhost:5000}") String aiServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.aiServiceUrl = aiServiceUrl;
    }

    public String extractEmbedding(String imageBase64) {
        Map<String, String> body = new HashMap<>();
        body.put("image", imageBase64);

        ResponseEntity<String> response = restTemplate.postForEntity(
                aiServiceUrl + "/extract-embedding",
                body,
                String.class);

        try {
            JsonNode root = objectMapper.readTree(response.getBody());

            String status = root.has("status") ? root.get("status").asText() : "OK";
            if (!"OK".equals(status) || root.get("embedding") == null || root.get("embedding").isNull()) {
                throw new RuntimeException("AI service could not extract face embedding (status: " + status + ")");
            }

            return root.get("embedding").asText();
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI service response", e);
        }
    }

    public EmbeddingResult extractEmbeddingWithDirection(String imageBase64) {
        Map<String, String> body = new HashMap<>();
        body.put("image", imageBase64);

        ResponseEntity<String> response = restTemplate.postForEntity(
                aiServiceUrl + "/extract-embedding",
                body,
                String.class);

        try {
            JsonNode root = objectMapper.readTree(response.getBody());

            String direction = root.has("direction") ? root.get("direction").asText() : "unknown";
            String status = root.has("status") ? root.get("status").asText() : "OK";

            if (!"OK".equals(status) || root.get("embedding") == null || root.get("embedding").isNull()) {
                return new EmbeddingResult(null, direction);
            }

            String embedding = root.get("embedding").asText();
            return new EmbeddingResult(embedding, direction);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI service response", e);
        }
    }

    public String findDuplicateFace(String newEmbeddingJson, List<FaceEmbedding> otherEmbeddings) {
        double[] newVec = parseEmbedding(newEmbeddingJson);
        if (newVec == null)
            return null;

        for (FaceEmbedding fe : otherEmbeddings) {
            double[] existingVec = parseEmbedding(fe.getEmbedding());
            if (existingVec == null)
                continue;

            double distance = euclideanDistance(newVec, existingVec);
            if (distance < 0.5) {
                return fe.getEmployee().getFullName();
            }
        }
        return null;
    }

    private double[] parseEmbedding(String json) {
        try {
            com.fasterxml.jackson.databind.JsonNode arr = objectMapper.readTree(json);
            if (!arr.isArray())
                return null;
            double[] vec = new double[arr.size()];
            for (int i = 0; i < arr.size(); i++) {
                vec[i] = arr.get(i).asDouble();
            }
            return vec;
        } catch (Exception e) {
            return null;
        }
    }

    private double euclideanDistance(double[] a, double[] b) {
        if (a.length != b.length)
            return Double.MAX_VALUE;
        double sum = 0;
        for (int i = 0; i < a.length; i++) {
            double d = a[i] - b[i];
            sum += d * d;
        }
        return Math.sqrt(sum);
    }

    public IdentifyResult identifyFace(String imageBase64, List<FaceEmbedding> allEmbeddings) {
        String embeddingJson = extractEmbedding(imageBase64);
        double[] newVec = parseEmbedding(embeddingJson);
        if (newVec == null)
            return null;

        double bestDistance = Double.MAX_VALUE;
        Employee bestEmployee = null;

        for (FaceEmbedding fe : allEmbeddings) {
            double[] existingVec = parseEmbedding(fe.getEmbedding());
            if (existingVec == null)
                continue;

            double distance = euclideanDistance(newVec, existingVec);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestEmployee = fe.getEmployee();
            }
        }

        if (bestDistance < 0.5 && bestEmployee != null) {
            return new IdentifyResult(bestEmployee, bestDistance);
        }
        return null;
    }

    public static class IdentifyResult {
        private final Employee employee;
        private final double distance;

        public IdentifyResult(Employee employee, double distance) {
            this.employee = employee;
            this.distance = distance;
        }

        public Employee getEmployee() {
            return employee;
        }

        public double getDistance() {
            return distance;
        }
    }

    public static class EmbeddingResult {
        private final String embedding;
        private final String direction;

        public EmbeddingResult(String embedding, String direction) {
            this.embedding = embedding;
            this.direction = direction;
        }

        public String getEmbedding() {
            return embedding;
        }

        public String getDirection() {
            return direction;
        }
    }
}