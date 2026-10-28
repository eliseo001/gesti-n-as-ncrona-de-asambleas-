package com.consorcio.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.function.Function;

/**
 * Generación y validación de tokens JWT firmados con HMAC-SHA.
 * <ul>
 *   <li>subject: email del usuario</li>
 *   <li>claim "rol": rol del usuario</li>
 * </ul>
 */
@Service
public class JwtService {

    public static final String CLAIM_ROL = "rol";

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String base64Secret,
                      @Value("${jwt.expiration-ms}") long expirationMs) {
        byte[] keyBytes = Decoders.BASE64.decode(base64Secret);
        // Keys.hmacShaKeyFor lanza WeakKeyException si la clave tiene menos de 256 bits
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    // ---------------------------------------------------------------- generación

    public String generateToken(String email, String rol) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim(CLAIM_ROL, rol)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(signingKey)
                .compact();
    }

    public String generateToken(UserDetailsImpl userDetails) {
        return generateToken(userDetails.getUsername(), userDetails.getRol());
    }

    // ---------------------------------------------------------------- validación

    /**
     * Verifica firma, expiración y que el subject coincida con el usuario cargado.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getSubject().equals(userDetails.getUsername())
                    && claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    // ---------------------------------------------------------------- extracción

    /**
     * @throws JwtException si el token es inválido, está mal formado, expirado o la firma no coincide.
     */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public String extractRol(String token) {
        return extractClaim(token, claims -> claims.get(CLAIM_ROL, String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
