# This is Final Project of CNL team 10 , 2017.

## TODO
```
1. login, logout
2. userlist and BAN
3. ANYTHING about SQL
4. youtube video should auto-play
5. seller 更新之後 bidder 才進來，該怎麼更新？
-->當seller'開始拍賣'的關起來的時候，所有的bid都return fail
6. 出價的錢要禁止輸入字串or負數（type已經用number，可另外加上js的驗證）
-->改成每次一有新的拍賣開始就創建一個prodcut的object，並push到productList裡面，之後就更新資料
7. end auction後server該做什麼？傳給seller下標者的資訊嗎？
8. 所有的排版加油 O_<

9. client send bid(get current price, +10, send to server), need to define the interface
10. server receive bid and update

```
## Execution
```javascript
npm install
node server.js
```
## Finished Works
```
1. Youtube stream video
2. setting/bidding interface
3. chat room
3. start and end auction (end時最高金額reset為0，server的處理還沒有加上)
4. 每次出價都會跳出確認視窗，顯示出價價格，送出後會有幾種response 
  a.價錢小於目前最高價 FAIL
  b.此商品已經結標 FAIL
  c.自己已經是目前的最高價出標者 FAIL
  d.SUCCESS
  e.比別人晚出價 FAIL

```
## requirement
```
npm install ursa
```
## Need test
```
register
```
