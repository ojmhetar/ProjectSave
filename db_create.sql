DROP TABLE IF EXISTS BookEntry; 
DROP TABLE IF EXISTS users; 

CREATE TABLE users(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	email VARCHAR(128) NOT NULL,
	password VARCHAR(1024) NOT NULL	
);

CREATE TABLE BookEntry
(
   id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
   isbn VARCHAR(128) NOT NULL, 
   title VARCHAR(128) NOT NULL,
   author VARCHAR(128) NOT NULL,
   vol VARCHAR(128) NOT NULL, 
   cond VARCHAR(128) NOT NULL,
   comments VARCHAR(128) NOT NULL,
   price DECIMAL(7,2) NOT NULL, 
   date_posted DATE, 
   user_id INT,
   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


