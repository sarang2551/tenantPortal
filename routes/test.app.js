const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index'); // Import Express
let should = chai.should();

chai.use(chaiHttp);

describe('/POST accountRegistrationTenant', () => {
    it('it should not POST without required parameters or if user already exists', (done) => {
        let tenant = {
            username: "test_id",
            password: "test_password",
        }
      chai.request(app)
          .post('/tenant/accountRegistrationTenant')
          .send(tenant)
          .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('result');
                res.body.result.should.be(false);
            done();
          });
    });

});

