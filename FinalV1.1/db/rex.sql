create database rex;
use rex;
-- SET SQL_SAFE_UPDATES = 0;

CREATE TABLE Users (
    User_Name varchar(255) NOT NULL,
    User_Password varchar(255) NOT NULL,
    User_Role varchar(255) NOT NULL,
    PRIMARY KEY (User_Name)
);

-- drop table Users;
-- delete from Users;

INSERT INTO Users (User_Name, User_Password, User_Role)
VALUES ('admin', '123', 'admin');

-- INSERT INTO Users (User_Name, User_Password, User_Role)
-- VALUES ('sup', '123', 'sup');

-- INSERT INTO Users (User_Name, User_Password, User_Role)
-- VALUES ('opr', '123', 'opr');

-- INSERT INTO Users (User_Name, User_Password, User_Role)
-- VALUES ('qa', '123', 'qa');

-- select * from Users;

CREATE TABLE Files (
    File_No varchar(255) NOT NULL,
    Item_Des varchar(255) default null,
    Dra_No varchar(255) default null,
    Dra_Iss varchar(255) default null,
    Jig_Sts varchar(255) default null,
    saved int default 0,
    len int default null,
    md int default null,
    mark int default null,
    turn int default null,
    adj int default null,
    kk int default null,
    ind int default null,
    clr varchar(255) default null,
    gap int default null,
    dFAI datetime default null,
    dval datetime default null,
    valdue datetime default null,
    darc datetime default null,
    cmt varchar(255) default null,
    PRIMARY KEY (File_No)
);

CREATE TABLE exeFiles (
    File_No varchar(255) NOT NULL,
    Item_Des varchar(255) default null,
    Dra_No varchar(255) default null,
    Dra_Iss varchar(255) default null,
    Jig_Sts varchar(255) default null,
    saved int default 0,
    len int default null,
    md int default null,
    mark int default null,
    turn int default null,
    adj int default null,
    kk int default null,
    ind int default null,
    clr varchar(255) default null,
    gap int default null,
    dFAI datetime default null,
    dval datetime default null,
    valdue datetime default null,
    darc datetime default null,
    cmt varchar(255) default null,
    PRIMARY KEY (File_No)
);

-- desc Files;

-- INSERT INTO Files (File_No, Jig_Sts)
-- VALUES ('BCM0001', 'Work');

select * from exeFiles;
select * from Files;
-- rop table Fi-- les;
-- delete from Files;

-- delete from Files where File_No = "BCM0001" AND saved = 0 AND Item_Des is null;

CREATE TABLE tmpjig (
    ind int NOT NULL,
    clr varchar(255) NOT NULL,
    gap int NOT NULL
);

CREATE TABLE exejig (
    ind int NOT NULL,
    clr varchar(255) NOT NULL,
    gap int NOT NULL
);

select * from tmpjig;
select * from exejig;
-- drop table tmpjig;
-- delete from tmpjig;

show tables;
-- drop table exejig;

-- select * from bcm002;
