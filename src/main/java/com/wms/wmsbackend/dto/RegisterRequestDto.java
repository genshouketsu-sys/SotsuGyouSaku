package com.wms.wmsbackend.dto;

/**
 * 新規登録リクエスト DTO / 注册请求 DTO
 */
public class RegisterRequestDto {

    private String username;
    private String password;

    public RegisterRequestDto() {}

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
