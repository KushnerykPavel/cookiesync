class SimpleSync {
    constructor(redisInstance, limitRate) {
        this.r = redisInstance;
        this.lr = limitRate;
    }

    save_sync(uid, partner_id, partner_uid) {
        /*
        You should implement save_sync function, which creates the following mappings in Redis:
        <uid, partner_id> → partner_uid
        <partner_id, partner_uid> → uid
        Hint: store key pair as the string in Redis
        Moreover, save_sync function has to use “expire” redis method to set “ttl” value for each pair (Redis key). Each pair
        <uid, partner_id> and <partner_id, partner_uid> has to use ttl for the specified “partner_id”.

        Set the values for the pairs <partner_id, uid> and <partner_id, partner_uid>
        Do not forget to set the ttls which you defined in the function set_ttls
        Agrs:
        r (redis.StrictRedis): redis instance
        uid (str): cookie uid
        partner_id (int): id of the partner
        partner_uid (str): uid of the partner
        Examples:
        >>> save_sync(r, 'uid_1', 10, 'partner_uid_1')
        */
        this.r.hget("ttls", partner_id, (err, rez) => {
            this.r.set(`${uid}|${partner_id}`, partner_uid, 'EX', rez);
            this.r.set(`${partner_uid}|${partner_id}`, uid, 'EX', rez);
        });
    }

    limit_rate(partner_id, func, cb) {
        let key = `${partner_id}|${func}`
        this.r.get(key, (err, rez) => {
            if(!rez) {
                this.r.set(key, 1, 'EX', 1);
                return cb(true)
            }
            if(rez >= this.lr) {
                return cb(false)
            }
            let multi = this.r.multi();
            multi.incr(key)
            multi.exec();
            return cb(true)
        })
    }

    get_partner_uid(uid, partner_id, cb) {
        /*
        Get the partner id by the pair (uid, partner id)

        Args:
            r (redis.StrictRedis): redis instance
            uid (str): cookie uid
            partner_id (int): id of the partner

        Examples:
            >>> get_partner_uid(r, 'e5a370cc-6bdc-43ae-baaa-8fd4531847f7', 12)
         */
        this.limit_rate(partner_id, 'get_partner_uid',rez => {
            if(!rez) return cb(null, null);
            this.r.get(`${uid}|${partner_id}`, (err, partner_uid) => {
                if(err) return cb(err)

                return cb(null, partner_uid)
            })
        })
    }

    get_uid(partner_id, partner_uid, cb){
        /*
        Get the uid by the pair (partner id, partner uid)

        Args:
             r (redis.StrictRedis): redis instance
             partner_id (int): id of partner
             partner_uid (str): uid of partner

        Examples:
            >>> get_uid(r, 12, '25b6e9a6-fca8-427c-94df-2577e62b2bf0')

         */
        this.limit_rate(partner_id, 'get_uid',rez => {
            if (!rez) return cb(null, null);
            this.r.get(`${partner_uid}|${partner_id}`, (err, uid) => {
                if (err) return cb(err)
                return cb(null, uid)
            })
        })
    }

    set_ttls(ttls) {
        /*Set the ttl by partner id

        Args:
        r (redis.StrictRedis): redis instance
        ttls (dict): dictionary of pairs <partner_id, ttl>

        Examples:
        >>> set_ttls(r, {12: 5, 3: 1})
        */
         Object.keys(ttls).map(v => {
            this.r.hset("ttls", v, ttls[v]);
        });
    }
}

module.exports = SimpleSync;