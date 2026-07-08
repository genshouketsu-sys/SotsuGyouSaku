package com.wms.wmsbackend.security;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

/**
 * JWT ユーティリティ / JWT 工具类
 * トークンの生成・検証・クレーム抽出を行う。
 * 负责 Token 的生成、验证和 Claims 提取。
 */
@Component
public class JwtUtil {

    /**
     * JWT 署名秘密鍵 / JWT 签名密钥
     * ⚠️  [SEC] 此处无 fallback 默认值 — 必须通过环境变量 JWT_SECRET 注入。
     *           若未设置，Spring Boot 启动时将抛出异常，而非使用不安全的默认值。
     *           Set via: export JWT_SECRET=$(openssl rand -base64 64)
     */
    @Value("${jwt.secret}")
    private String secretKey;

    /** JWT 有効期限（ミリ秒）: 10 時間 / JWT 有效期（毫秒）: 10 小时 */
    private static final long TOKEN_VALIDITY_MS = 1000L * 60 * 60 * 10;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    /** トークンからユーザー名を抽出 / 从 Token 提取用户名 */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** トークンから有効期限を抽出 / 从 Token 提取有效期 */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /** トークンから任意のクレームを抽出 / 从 Token 提取任意 Claim */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /** ユーザー情報から JWT を生成 / 根据用户信息生成 JWT */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + TOKEN_VALIDITY_MS))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** トークンを検証する / 验证 Token 是否有效 */
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}
