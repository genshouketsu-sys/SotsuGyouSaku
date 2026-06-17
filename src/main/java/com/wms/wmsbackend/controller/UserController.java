package com.wms.wmsbackend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wms.wmsbackend.service.UserService;

/**
 * ユーザーコントローラー / 用户控制器
 *
 * GET  /api/user/profile         — 获取当前用户资料
 * PUT  /api/user/profile         — 更新 displayName / email / avatarUrl
 * PUT  /api/user/password        — 修改密码（需当前密码验证）
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    /** ユーザープロフィール取得 / 获取用户资料 */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Map<String, Object> response = userService.getProfile();
        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(404).body(response);
    }

    /** プロフィール更新 / 更新用户资料 (displayName / email / avatarUrl) */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> payload) {
        Map<String, Object> response = userService.updateProfile(payload);
        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(404).body(response);
    }

    /** パスワード変更 / 修改密码 */
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> payload) {
        String currentPassword = payload.get("currentPassword");
        String newPassword = payload.get("newPassword");

        if (currentPassword == null || currentPassword.isBlank()
                || newPassword == null || newPassword.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "currentPassword and newPassword are required"
            ));
        }

        Map<String, Object> response = userService.updatePassword(currentPassword, newPassword);
        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(400).body(response);
    }
}
