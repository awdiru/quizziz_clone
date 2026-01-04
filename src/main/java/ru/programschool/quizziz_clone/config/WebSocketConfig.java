package ru.programschool.quizziz_clone.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Value("${app.cors.allowed-origins}")
    private String FRONTEND_ADDRESS;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Префикс для сообщений ОТ сервера К клиенту (подписки)
        config.enableSimpleBroker("/topic");
        // Префикс для сообщений ОТ клиента К серверу
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Точка подключения к WebSocket
        registry.addEndpoint("/ws-quiz")
                .setAllowedOrigins(FRONTEND_ADDRESS)
                .withSockJS();
    }
}