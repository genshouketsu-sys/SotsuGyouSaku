package com.wms.wmsbackend.exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

/**
 * 全局异常处理器 - 统一处理各类业务异常 特别关注幂等性异常的处理，确保返回适当的 HTTP 状态码和错误消息
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * 处理幂等性异常 返回 409 Conflict 状态码，表示请求冲突（重复提交）
     */
    @ExceptionHandler(IdempotentException.class)
    public ResponseEntity<ErrorResponse> handleIdempotentException(
            IdempotentException ex, WebRequest request) {

        log.warn("检测到幂等性异常: code={}, message={}", ex.getCode(), ex.getMessage());

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code(ex.getCode())
                .message(ex.getMessage())
                .status(HttpStatus.CONFLICT.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    /**
     * 处理其他运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(
            RuntimeException ex, WebRequest request) {

        log.error("运行时异常", ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("RUNTIME_ERROR")
                .message(ex.getMessage() != null ? ex.getMessage() : "服务器内部错误")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * 处理通用异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(
            Exception ex, WebRequest request) {

        log.error("未预期的异常", ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .code("ERROR")
                .message("服务器内部错误，请联系管理员")
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .timestamp(LocalDateTime.now())
                .path(request.getDescription(false).replace("uri=", ""))
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * 错误响应数据结构
     */
    @Data
    @AllArgsConstructor
    public static class ErrorResponse {

        private String code;
        private String message;
        private int status;
        private LocalDateTime timestamp;
        private String path;

        public static ErrorResponseBuilder builder() {
            return new ErrorResponseBuilder();
        }

        public static class ErrorResponseBuilder {

            private String code;
            private String message;
            private int status;
            private LocalDateTime timestamp;
            private String path;

            public ErrorResponseBuilder code(String code) {
                this.code = code;
                return this;
            }

            public ErrorResponseBuilder message(String message) {
                this.message = message;
                return this;
            }

            public ErrorResponseBuilder status(int status) {
                this.status = status;
                return this;
            }

            public ErrorResponseBuilder timestamp(LocalDateTime timestamp) {
                this.timestamp = timestamp;
                return this;
            }

            public ErrorResponseBuilder path(String path) {
                this.path = path;
                return this;
            }

            public ErrorResponse build() {
                return new ErrorResponse(code, message, status, timestamp, path);
            }
        }
    }
}
