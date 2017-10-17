# Live Stream Auction
## Description
This Web Application allows the user to create private auction room and invite bidders to compete for products. Currently need YouTube Live account.

## Execution

```javascript
npm install
node server.js
```
## Finished Works

- [x] Youtube stream video
- [x] setting/bidding interface
- [x] chat room(seller message have some bug,sender is 'undefined')
- [x] start and end auction (end時最高金額reset為0，server的處理還沒有加上)
- [x] 每次出價都會跳出確認視窗，顯示出價價格，送出後會有幾種response --> 改成每次一有新的拍賣開始就創建一個prodcut的object，之後就更新資料

  - 價錢小於目前最高價 FAIL
  - 此商品已經結標 FAIL
  - 自己已經是目前的最高價出標者 FAIL
  - 比別人晚出價 FAIL
  - SUCCESS
  
- [x] youtube video auto-play
- [x] When Bidder comes earlier than Seller, Server will give it some default settings.
- [x] userList 傳送與更新（剩下排版跟處理傳入的東西）

## Requirement
```
npm install ursa
```
## Tutorial

### db.js

```javascript
const db = require("./db.js");
db.query("your query string", callbackfn);
```
### mysql 
```mysql
CREATE DATABASE member;
USE member;
CREATE TABLE users(
   pid INT NOT NULL AUTO_INCREMENT,
   name VARCHAR(100) NOT NULL,
   email VARCHAR(40) NOT NULL,
   password VARCHAR(40) NOT NULL,
   type VARCHAR(20) NOT NULL,
   PRIMARY KEY ( pid)
);

