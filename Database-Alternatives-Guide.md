# PostgreSQL Setup for Chat Application

## 🐘 **Option 1: Render PostgreSQL Database**

### **Step 1: Update Dependencies**

Add to your `pom.xml`:
```xml
<!-- Replace MongoDB dependency with PostgreSQL -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Remove this MongoDB dependency -->
<!-- <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb</artifactId>
</dependency> -->
```

### **Step 2: Update Message Entity**

Replace MongoDB annotations with JPA:
```java
package com.ChatApp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(nullable = false)
    private String sender;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    private Integer roomid;

    public Message() {
        this.timestamp = LocalDateTime.now();
    }

    public Message(String content, String sender, Integer roomid) {
        this.content = content;
        this.sender = sender;
        this.roomid = roomid;
        this.timestamp = LocalDateTime.now();
    }
}
```

### **Step 3: Update Repository**

```java
package com.ChatApp.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatServiceRepository extends JpaRepository<Message, Long> {

    // Find messages by room ID
    List<Message> findByRoomidOrderByTimestampAsc(Integer roomid);
    
    // Find recent messages (last 50)
    List<Message> findTop50ByOrderByTimestampDesc();
    
    // Find messages by sender
    List<Message> findBySenderOrderByTimestampAsc(String sender);
    
    // Custom query for search
    @Query("SELECT m FROM Message m WHERE m.content LIKE %:searchText% ORDER BY m.timestamp ASC")
    List<Message> findByContentContaining(String searchText);
}
```

### **Step 4: Application Configuration**

```properties
# PostgreSQL Configuration
spring.application.name=ChatApp
server.port=${PORT:8080}
server.address=0.0.0.0

# Database Configuration
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# CORS Configuration
cors.allowed.origins=${ALLOWED_ORIGINS:http://localhost:3000}
```

### **Step 5: Create PostgreSQL Database on Render**

1. **Render Dashboard** → **New** → **PostgreSQL**
2. **Configure Database**:
   - Name: `realchatapp-db`
   - Region: Same as your web service
   - PostgreSQL Version: 15
3. **Get Connection Details** from database dashboard
4. **Add Environment Variables** to your web service:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

---

## 🗃️ **Option 2: Local Database Development**

For development and testing without cloud dependencies:

### **H2 In-Memory Database (Easiest)**

```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency>
```

```properties
# H2 Configuration (application-dev.properties)
spring.datasource.url=jdbc:h2:mem:chatapp
spring.datasource.driver-class-name=org.h2.Driver
spring.h2.console.enabled=true
spring.jpa.hibernate.ddl-auto=create-drop
```

### **SQLite (File-based)**

```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
</dependency>
```

```properties
# SQLite Configuration
spring.datasource.url=jdbc:sqlite:chatapp.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
```

---

## ☁️ **Option 3: Other Cloud Databases**

### **PlanetScale (MySQL)**
- Free tier available
- Serverless MySQL platform
- Git-like branching for databases

### **Supabase (PostgreSQL)**
- Open source Firebase alternative
- Real-time subscriptions
- Built-in authentication

### **Railway (PostgreSQL/MySQL)**
- Simple deployment platform
- Integrated database hosting
- GitHub integration

### **ElephantSQL (PostgreSQL)**
- Managed PostgreSQL service
- Free tier available
- Easy setup

---

## 🐳 **Option 4: Docker with Database**

For complete local development:

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: chatapp
      POSTGRES_USER: chatuser
      POSTGRES_PASSWORD: chatpass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  postgres_data:
  mongo_data:
```

---

## 🎯 **Recommendation by Use Case**

### **🚀 For Render Deployment: PostgreSQL**
- **Best Choice**: Render PostgreSQL
- **Why**: Native integration, managed service, reliable
- **Setup Time**: 10 minutes

### **🔧 For Local Development: H2**
- **Best Choice**: H2 In-Memory Database
- **Why**: Zero setup, fast testing, no installation
- **Setup Time**: 2 minutes

### **🌍 For Production (Non-Render): PlanetScale**
- **Best Choice**: PlanetScale MySQL
- **Why**: Excellent free tier, scaling capabilities
- **Setup Time**: 15 minutes

### **💰 Budget Considerations**
- **Free**: H2, SQLite, Render PostgreSQL (limited), PlanetScale
- **Paid**: MongoDB Atlas, Railway, Supabase Pro

---

## 🔄 **Migration Steps from MongoDB**

If you want to switch from MongoDB to PostgreSQL:

1. **Update Dependencies** (remove MongoDB, add JPA + PostgreSQL)
2. **Convert Entity Classes** (MongoDB → JPA annotations)
3. **Update Repository** (MongoRepository → JpaRepository)
4. **Change Configuration** (MongoDB URI → PostgreSQL URL)
5. **Test Locally** with H2 first
6. **Deploy** with Render PostgreSQL

Would you like me to help you implement any of these alternatives? The easiest path for Render deployment would be PostgreSQL, while H2 is perfect for quick local testing.
