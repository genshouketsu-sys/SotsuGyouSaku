package com.wms.wmsbackend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.wms.wmsbackend.entity.User;
import com.wms.wmsbackend.mapper.UserMapper;

@Service
public class UserService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Object> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userMapper.findByUsername(username);
        if (user == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "User not found");
            return error;
        }

        Map<String, Object> profile = new HashMap<>();
        profile.put("success", true);
        profile.put("username", user.getUsername());
        profile.put("displayName", user.getDisplayName());
        profile.put("email", user.getEmail());
        profile.put("avatarUrl", user.getAvatarUrl());
        profile.put("role", user.getRole());
        return profile;
    }

    public Map<String, Object> updateProfile(Map<String, String> payload) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userMapper.findByUsername(username);

        if (user == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "User not found");
            return error;
        }

        if (payload.containsKey("displayName")) {
            user.setDisplayName(payload.get("displayName"));
        }
        if (payload.containsKey("email")) {
            user.setEmail(payload.get("email"));
        }
        if (payload.containsKey("avatarUrl")) {
            user.setAvatarUrl(payload.get("avatarUrl"));
        }

        userMapper.updateProfile(user);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Profile updated successfully");
        return response;
    }

    public Map<String, Object> updatePassword(String currentPassword, String newPassword) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userMapper.findByUsername(username);

        if (user == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "User not found");
            return error;
        }

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Incorrect current password");
            return error;
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userMapper.updatePassword(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password updated successfully");
        return response;
    }
}
