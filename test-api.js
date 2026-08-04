const http = require('http');

http.get('http://localhost/pesantren-harmony-hub/api/crud.php?table=pengaturan', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
}).on('error', (err) => console.error(err));
