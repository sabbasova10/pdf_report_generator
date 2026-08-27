# pdf_report_generator


![alt text](image.png)


![alt text](image-1.png)

By using small requests the main job is done in less period of time for user. Used when there are a lot of data or a lot of users at the same time.
Using idempotency helps to avoid additional work, email resending, report generstion on the same date, reasking for web pages in db.


# Curls

 time curl -i -X POST http://localhost:8000/reports
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 63
ETag: W/"3f-KxtBtUTcGj6gJur5CKJkpFhSUJ8"
Date: Thu, 27 Aug 2026 20:17:51 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"file":"reports/1787861871029.pdf","message":"Created"}
real    0m0.721s
user    0m0.007s
sys     0m0.008s


curl -i http://localhost:8000/reports/1
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 36
ETag: W/"24-DN7K9dagJcw7Ruw3sxLliuQki/g"
Date: Thu, 27 Aug 2026 20:18:31 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"link":"reports/1787861871029.pdf"}

 curl -i http://localhost:8000/reports/3
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-0YAItIJ1shWF2zRflWw3Pgww6aU"
Date: Thu, 27 Aug 2026 20:19:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"FileNotFound"}


sendFile() option displays binary output in the terminal.


# time management  
time curl -i -X POST http://localhost:8000/reports
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 81
ETag: W/"51-ih2zfwvQe4af0B33HRBhv+zlTGA"
Date: Thu, 27 Aug 2026 20:58:55 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Already created","file":"reports/2026-08-27.pdf","date":"2026-08-27"}
real 0m0.016s
user 0m0.009s
sys  0m0.006s


curl -i -X POST http://localhost:8000/rep
orts \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 73
ETag: W/"49-p+hWMCEaQDlAiBSo8kmdLBtdvG8"
Date: Thu, 27 Aug 2026 21:00:30 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"message":"Updated","file":"reports/2026-08-27.pdf","date":"2026-08-27"}