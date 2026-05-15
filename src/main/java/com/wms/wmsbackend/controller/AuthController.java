package com.wms.wmsbackend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.wms.wmsbackend.dto.LoginRequestDto;
import com.wms.wmsbackend.dto.RegisterRequestDto;
import com.wms.wmsbackend.service.AuthService;

/**
 * 認証コントローラー / 认证控制器
 * ユーザー登録・ログインエンドポイントを提供する。
 * 提供用户注册和登录接口。
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * ユーザー登録 / 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDto request) {
        Map<String, Object> response = authService.register(request.getUsername(), request.getPassword());
        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }

    /**
     * ログイン / 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto request) {
        Map<String, Object> response = authService.login(request.getUsername(), request.getPassword());
        if ((Boolean) response.get("success")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(response);
    }
}
