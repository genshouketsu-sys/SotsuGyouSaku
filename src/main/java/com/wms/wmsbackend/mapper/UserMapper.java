package com.wms.wmsbackend.mapper;

import com.wms.wmsbackend.entity.User;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {

    @Select("SELECT * FROM wms_user WHERE username = #{username}")
    User findByUsername(String username);

    @Insert("INSERT INTO wms_user (username, password_hash, role) VALUES (#{username}, #{passwordHash}, #{role})")
    int insert(User user);
}
