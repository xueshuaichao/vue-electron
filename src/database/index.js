import { remote } from 'electron';

const db = remote.getGlobal('db');
export default db;
// import Datastore from 'nedb';
// import path from 'path';

// const { app } = remote;
// const basepath = app.getAppPath();

// // Type 4: Persistent datastore for a Node Webkit app called 'nwtest'
// // For example on Linux, the datafile will be ~/.config/nwtest/nedb-data/something.db
// const db = {};

// db.textbook = new Datastore({ filename: path.join(basepath, 'textbook.db'), autoload: true });

// console.log(path.join(basepath, 'textbook.db'));
// export default db;
