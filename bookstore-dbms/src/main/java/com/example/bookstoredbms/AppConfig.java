package com.example.bookstoredbms;

import java.io.IOException;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.bookstoredbms.hbase.HBaseConnector;

@Configuration
public class AppConfig {
    @Bean
    public HBaseConnector hBaseConnector() throws IOException {
        return new HBaseConnector();
    }
}