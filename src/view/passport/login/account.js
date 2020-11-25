/* eslint-disable class-methods-use-this */
/**
 * @des account management
 */
import db from '@/database';

const { userAccount } = db;
const uid = 'APP_ACCOUNT';

class Account {
    accountInfo = [];

    dbStatus = false;

    status = false;

    push(account) {
        const { accountInfo } = this;

        let index = -1;
        if (accountInfo.length) {
            index = accountInfo.findIndex(v => v.uname === account.uname);
        }
        if (index > -1) {
            accountInfo.splice(index, 1);
        }
        accountInfo.push(account);
    }

    save(account) {
        if (account) {
            this.push({ ...account });
        }
        userAccount.remove({ _id: uid }, {}, (err) => {
            if (!err) {
                userAccount.insert(
                    { _id: uid, account: this.accountInfo, status: !!account },
                    (err, doc) => {
                        console.log(err, doc, 'add');
                    },
                );
            }
        });
    }

    getAccountInfo() {
        return new Promise((reslove, reject) => {
            userAccount.find({ _id: uid }, (err, doc) => {
                if (err) {
                    reject(err);
                }
                if (doc.length) {
                    const { account, status } = doc[0];
                    this.accountInfo = JSON.parse(JSON.stringify(account));
                    console.log(this.accountInfo, 'init');
                    this.status = status;
                    this.dbStatus = true;
                    reslove({ account, status });
                } else {
                    reslove({ account: [], status: false });
                }
            });
        });
    }

    setAccountStatus(key) {
        this.save(key);
    }
}

const am = new Account();
// eslint-disable-next-line import/prefer-default-export
export { am };
