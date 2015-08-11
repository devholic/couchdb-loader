# couchdb-loader
Easy backup / restore for CouchDB

## How to use
* Required Packages
  * [moment.js](https://www.npmjs.com/package/moment)
  * [node-schedule](https://www.npmjs.com/package/node-schedule)
  * [request](https://www.npmjs.com/package/request)

1. 프로젝트를 가져옵니다. (private repository에 fork뜨는거 추천)
2. settings.pref에 db주소와 사용자 계정을 설정합니다.
  * backup_address
    * backup.js가 변경내용을 확인할 주소입니다. *http://*를 제외한 나머지 url + DB이름을 설정해주세요.
    * ex) db.example.com/testdb
  * restore_address
    * restore.js가 backup할 내용을 복원할 주소입니다. *http://*를 제외한 나머지 url + DB이름을 설정해주세요.
    * ex) db.example.com/testdb
  * id / password
    * DB에 접근할 수 있는 아이디와 비밀번호를 설정해주세요.
3. CouchDB 서버가 켜져있는지 확인 한 뒤
```
  node backup
```
  으로 backup 서비스를 실행합니다. 참 쉽죠?!

* 복원할 때는
```
  node restore
```

