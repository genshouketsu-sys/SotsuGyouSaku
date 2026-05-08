package com.wms.wmsbackend.exception;

/**
 * 幂等性异常 - 当检测到重复提交时抛出 用于区分普通异常，便于特殊处理
 */
public class IdempotentException extends RuntimeException {

    private String code;
    private String message;

    public IdempotentException(String message) {
        super(message);
        this.code = "IDEMPOTENT_ERROR";
        this.message = message;
    }

    public IdempotentException(String code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    public IdempotentException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }
}
