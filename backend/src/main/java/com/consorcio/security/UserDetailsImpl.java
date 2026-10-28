package com.consorcio.security;

import com.consorcio.models.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adaptador entre la entidad {@link Usuario} y el modelo de Spring Security.
 * El email actúa como username y el rol se expone como authority "ROLE_&lt;ROL&gt;",
 * lo que permite usar hasRole("ADMIN") / @PreAuthorize("hasRole('ADMIN')").
 */
public class UserDetailsImpl implements UserDetails {

    private static final String ROLE_PREFIX = "ROLE_";

    private final Integer idUsuario;
    private final String email;
    private final String passwordHash;
    private final String rol;
    private final List<GrantedAuthority> authorities;

    public UserDetailsImpl(Usuario usuario) {
        this.idUsuario = usuario.getIdUsuario();
        this.email = usuario.getEmail();
        this.passwordHash = usuario.getPasswordHash();
        this.rol = usuario.getRol();
        String authority = rol.startsWith(ROLE_PREFIX) ? rol : ROLE_PREFIX + rol.toUpperCase();
        this.authorities = List.of(new SimpleGrantedAuthority(authority));
    }

    public Integer getIdUsuario() {
        return idUsuario;
    }

    public String getRol() {
        return rol;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    // isAccountNonExpired, isAccountNonLocked, isCredentialsNonExpired e isEnabled
    // tienen implementación por defecto (true) en Spring Security 6.
}
