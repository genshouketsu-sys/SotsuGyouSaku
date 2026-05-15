package com.wms.wmsbackend.entity;

import java.time.LocalDateTime;

/**
 * ユーザーエンティティ / 用户实体
 * wms_user テーブルに対応する。/ 对应 wms_user 表。
 */
public class User {

    private Long id;
    private String username;
    private String passwordHash;
    private String role;
    private String displayName;
    private String email;
    private String avatarUrl;
    /** java.time.LocalDateTime を使用（java.util.Date は非推奨）/ 使用 LocalDateTime（不推荐使用 java.util.Date） */
    private LocalDateTime createTime;

    public User() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
}
