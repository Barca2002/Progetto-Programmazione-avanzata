import jwt from 'jsonwebtoken';
import fs from 'fs';

//SERVER SIDE
const public_key = fs.readFileSync('jwtRS256.key.pub');
const private_key = fs.readFileSync('jwtRS256.key');

const token = jwt.sign({ user: 'me' }, private_key, { algorithm: 'RS256' });
console.log(token);

// CLIENT SIDE
const res = jwt.verify(token, public_key, { algorithms: ['RS256'] });
console.log(res);
                                                                                                                                                                                    