package com.example.bookstoredbms;

import org.apache.log4j.PropertyConfigurator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BookstoreDbmsApplication {
    public static void main(String[] args) {
        setupLoggingConfigs();
        SpringApplication.run(BookstoreDbmsApplication.class, args);
    }

    public static void setupLoggingConfigs() {
        var loggingConfigPath = BookstoreDbmsApplication.class
                .getClassLoader()
                .getResource("log4j.properties")
                .getPath();
        PropertyConfigurator.configure(loggingConfigPath);
    }
}
