-- Oracle用DDL
CREATE TABLE devices (
  device_id   NUMBER PRIMARY KEY,
  device_name VARCHAR2(50),
  device_detail VARCHAR2(200)
);

CREATE TABLE allocations (
  id         NUMBER PRIMARY KEY,
  device_id  NUMBER REFERENCES devices(device_id),
  date       DATE,
  timeslot   VARCHAR2(20),
  comment    VARCHAR2(30),
  bgcolor    VARCHAR2(20),
  fontcolor  VARCHAR2(20),
  borderstyle VARCHAR2(20),
  pos_x      NUMBER,
  pos_y      NUMBER,
  width      NUMBER,
  height     NUMBER
);
