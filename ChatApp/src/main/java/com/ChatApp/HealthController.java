package com.ChatApp;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import java.util.HashMap;
import java.util.Map;
import java.util.Date;

@RestController
public class HealthController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // Check MongoDB connection
            mongoTemplate.getCollection("messages").countDocuments();
            health.put("status", "UP");
            health.put("database", "connected");
        } catch (Exception e) {
            health.put("status", "DOWN");
            health.put("database", "disconnected");
            health.put("error", e.getMessage());
        }
        
        health.put("timestamp", new Date());
        health.put("service", "RealChatApp Backend");
        
        return health;
    }

    @GetMapping("/api/status")
    public Map<String, String> status() {
        Map<String, String> status = new HashMap<>();
        status.put("service", "RealChatApp API");
        status.put("status", "running");
        status.put("version", "1.0.0");
        status.put("timestamp", new Date().toString());
        return status;
    }
}
