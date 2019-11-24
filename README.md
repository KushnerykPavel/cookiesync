**Simple cookie sync service with Node.js and Redis**

Service represents of API with next endpoints: 
1. /ttls POST

        Set the ttl by partner id
        Args:
        ttls (dict): dictionary of pairs <partner_id, ttl>
        
        Request example: 
        '{"3":1,"12":50}'

2. /store-sync POST 

        Set the values for the pairs <partner_id, uid> and <partner_id, partner_uid>
         Do not forget to set the ttls which you defined in the function set_ttls
         Agrs:
         uid (str): cookie uid
         partner_id (int): id of the partner
         partner_uid (str): uid of the partner
         
         Request example:
         '{"uid":"365402ea-1942-4dc5-a70b-c40467b49e39","partner_id":12,"partner_uid":"4b6b3c9e-82f4-48a7-a87e-8f9e856fe303"}'
         
3. /uid GET 

        Get the uid by the pair (partner id, partner uid)
        Args:
         partner_id (int): id of partner
         partner_uid (str): uid of partner
         
        Request example:
         ?partner_id=12&partner_uid=365402ea-1942-4dc5-a70b-c40467b49e39
         
4. /partner-uid GET

         Get the partner id by the pair (uid, partner id)
         Args:
           uid (str): cookie uid
           partner_id (int): id of the partner
          Request example:
           ?uid=365402ea-1942-4dc5-a70b-c40467b49e39&partner_id=12
                 