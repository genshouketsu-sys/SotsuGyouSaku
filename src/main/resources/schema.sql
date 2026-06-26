CREATE TABLE IF NOT EXISTS product (
  id             BIGSERIAL     NOT NULL,
  sku_code       VARCHAR(50)   NOT NULL UNIQUE,
  name           VARCHAR(100)  NOT NULL,
  barcode        VARCHAR(100),
  stock          INT           NOT NULL DEFAULT 0,
  daily_usage    NUMERIC(10,2) DEFAULT 0.0,
  lead_time_days INT           DEFAULT 7,
  safety_stock   INT           DEFAULT 10,
  create_time    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  update_time    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS wms_user (
  id            BIGSERIAL     NOT NULL,
  username      VARCHAR(50)   NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'ROLE_ADMIN',
  display_name  VARCHAR(100),
  email         VARCHAR(100),
  avatar_url    VARCHAR(255),
  create_time   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS wms_scan_log (
  id        BIGSERIAL     NOT NULL,
  barcode   VARCHAR(100)  NOT NULL,
  user_id   VARCHAR(50),
  scan_time TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);