const chai = require('chai');

const chaiHttp = require('chai-http');
const app = require('../index'); // Import Express
let should = chai.should();

chai.use(chaiHttp);

describe('/POST tenants/verifyLogin', () => {
    it('should not verify authentication if object is missing password', (done) => {
        let tenant = {
            username: "test_id",
            password: "test_password",
        }
      chai.request(app)
          .post('/tenant/verifyLogin')
          .send(tenant)
          .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('result');
                res.body.result.should.be(false);
            done();
          });
    });
    it('should not verify authentication if object is missing username',(done)=>{
        let tenant = {
            password: "test_password",
        }
      chai.request(app)
          .post('/tenant/verifyLogin')
          .send(tenant)
          .end((err, res) => {
                res.should.have.status(500);
                res.body.should.have.property('message');
            done();
          });
    })
    

});

