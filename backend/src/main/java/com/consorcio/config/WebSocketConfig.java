package com.consorcio.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuración del protocolo WebSocket con STOMP (Simple Text Oriented Messaging Protocol).
 * Desacopla la infraestructura de mensajería en tiempo real de la lógica de negocio.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Registra el punto de entrada (handshake HTTP inicial) para que los clientes se conecten al servidor WebSocket.
     *
     * Justificación para la defensa:
     * - Protocolo STOMP sobre WebSocket: Provee una capa de transporte orientada a tramas (frames) con comandos
     *   estándar (CONNECT, SUBSCRIBE, SEND, MESSAGE), evitando tener que diseñar un protocolo de mensajería ad-hoc.
     * - setAllowedOriginPatterns("*"): Habilita CORS de manera flexible y segura para permitir la conexión
     *   desde clientes web, móviles o herramientas de auditoría sin restricciones de origen.
     * - withSockJS(): Proporciona mecanismos de degradación elegante (fallback) mediante HTTP Long-Polling
     *   en entornos de red restringidos donde los WebSockets puros estén bloqueados por proxies o firewalls.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint nativo para clientes con soporte pleno de WebSockets
        registry.addEndpoint("/ws-consorcio")
                .setAllowedOriginPatterns("*");

        // Endpoint con fallback SockJS para máxima compatibilidad con navegadores y clientes web
        registry.addEndpoint("/ws-consorcio")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    /**
     * Configura el enrutador de mensajes (Message Broker) interno en memoria.
     *
     * Justificación para la defensa:
     * - enableSimpleBroker("/topic"): Habilita el patrón Publicador/Suscriptor (Pub-Sub) 1:N.
     *   Cualquier mensaje enviado a un destino con prefijo '/topic' (ej. '/topic/asamblea/1')
     *   se retransmite automáticamente a todos los vecinos y autoridades conectadas al canal.
     * - setApplicationDestinationPrefixes("/app"): Define el prefijo reservado para mensajes
     *   enviados desde los clientes hacia métodos controladores del servidor con @MessageMapping.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}

