package com.wms.wmsbackend.annotation;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Idempotent {
    // 确保有这一行！
    String message() default "请勿重复提交"; 
    
    // 可能还有其他属性，比如 expire 等
    long expire() default 1;
}