const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
const PORT =8000

//passing test cases tenant, landlord login

describe('Tenant Authentication and Registration API', () => {
  it('should return 200 OK when valid credentials are provided for tenant login', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .post('/tenant/verifyLogin')
      .send({ username: 'RC_0001', password: 'test123' })
      .end((err, res) => {

        expect(res).to.have.status(200);

        done(); // Call done to indicate test completion
      });
  });
  it('should return 500  when invalid credentials are provided for tenant login', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .post('/tenant/verifyLogin')
      .send({ username: 'testuser2', password: 'testpassword2' })
      .end((err, res) => {
        expect(res).to.have.status(500);
        done(); 
      });
  });

});


//Additional tenant

describe('Tenant Routes', () => {

//service ticket godzilla with landlord ID acct
  it('should add a new service ticket', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .post('/tenant/addServiceTicket')
      .send({ userID: '64ad758ce3307f7723aa6330', tenantName: 'hefan3', unit: 'Unit 3' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal(200);
        expect(res.body).to.have.property('message').to.equal('Added Successfully');
        done();
      });
  });

  it('should update service ticket progress', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .put('/tenant/updateServiceTicketProgress')
      .send({ _id: '64c5fcfcaea880170d4a199c' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal(200);
        expect(res.body).to.have.property('message').to.equal('Updated Successfully');
        done();
      });
  });

  it('should get unit data for a specific user', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .get('/tenant/getUnitData/64ad758ce3307f7723aa6330')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal(200);
        expect(res.body).to.have.property('unitData');
        done();
      });
  });

  it('should get all service tickets for a specific user', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .get('/tenant/getAllServiceTickets/647f3b0628c6e292aebd999d')
      .end((err, res) => {
        expect(res).to.have.status(200);
        // Perform further assertions as needed
        done();
      });
  });

  it('should delete a service ticket', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .delete('/tenant/deleteServiceTicket')
      .send({ _id: '64c60ace17845f1a2c5988c3' }) //sr hefan2
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal(200);
        expect(res.body).to.have.property('message').to.equal('Ticket Deleted!');
        done();
      });
  });

  it('should get unit and landlord data for a specific user', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .get('/tenant/getUnit&LandlordData/647f3b0628c6e292aebd999d')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal(200);
        expect(res.body).to.have.property('tenantObject');
        done();
      });
  });

  it('should update feedback for a service ticket', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .put('/tenant/updateFeedback')
      .send({ serviceTicketID: '64af9e579456074014691709', feedbackRating: 2 })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal(200);
        expect(res.body).to.have.property('message').to.equal('Feedback updated!');
        done();
      });
  });

  it('should accept a quotation for a service ticket', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .put('/tenant/acceptQuotation')
      .send({ serviceTicketID: '64c5fcfcaea880170d4a199c', quotationAcceptedbyTenant: true })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal(200);
        expect(res.body).to.have.property('message').to.equal('Quotation Accepted');
        done();
      });
  });
});



// Landlord tests

describe('Landlord Routes', () => {
    // Test for verifying login
    it('should verify landlord login credentials', (done) => {
      chai
        .request(`http://localhost:${PORT}`)
        .post('/landlord/verifyLogin')
        .send({ username: 'landlord_1', password: 'test123' })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('userID');
          done();
        });
    });
  
    // Test for adding tenants
    it('should add new tenants to a unit', (done) => {
      chai
        .request(`http://localhost:${PORT}`)
        .post('/landlord/addTenants')
        .send({
          unitRef: '64ba634931dee5c2b995d4ef',
          landlordRef: '64873c12bd2e5989a5e90e1c',
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 200);
          expect(res.body).to.have.property('message', 'Tenant added successfully');
          done();
        });
    });
  
    // Test for adding a unit to dylan house
    it('should add a new unit to a building', (done) => {
      chai
        .request(`http://localhost:${PORT}`)
        .post('/landlord/addUnit')
        .send({
          unitNumber: '3',
          buildingID: '64b40ad206aee34f7aeb7e3b',
          monthlyRental: 300,
          userID: '647f393928c6e292aebd9999',
          images: ['img1.jpg', 'img2.jpg'],
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 200);
          expect(res.body).to.have.property('message', 'Successfully added Unit');
          done();
        });
    });
  
    // Test for getting all pending service tickets
    it('should get all pending service tickets for a landlord', (done) => {
      const sampleUserID = '64873c12bd2e5989a5e90e1c';
      chai
        .request(`http://localhost:${PORT}`)
        .get(`/landlord/getAllServiceTickets/${sampleUserID}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          //expect(res.body).to.be.an('array');
          expect(res.body).to.have.property('serviceTicket');
          done();
        });
    });
  
    // Test for getting all buildings owned by a landlord
    it('should get all buildings owned by a landlord', (done) => {
      const sampleUserID = '64873c12bd2e5989a5e90e1c'; //or landlord_1
      chai
        .request(`http://localhost:${PORT}`)
        .get(`/landlord/buildingsOwned/${sampleUserID}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('status', 200);
          expect(res.body).to.have.property('buildings');
          done();
        });
    });
  
    // Test for getting building information
    it('should get information about a specific building owned by a landlord', (done) => {
      const sampleBuildingID = '64b40ad206aee34f7aeb7e3b'; //or dylan house
      chai
        .request(`http://localhost:${PORT}`)
        .get(`/landlord/getBuildingInformation/${sampleBuildingID}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('status', 200);
          expect(res.body).to.have.property('unitsList'); //some have units but others don't
          done();
        });
    });
  
    // Test for getting tenant information
    it('should get information about a specific tenant', (done) => {
      const sampleTenantID = '64ad758ce3307f7723aa6330';
      chai
        .request(`http://localhost:${PORT}`)
        .get(`/landlord/getTenantInfo/${sampleTenantID}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('status', 200);
          expect(res.body).to.have.property('tenantInfo');
          done();
        });
    });
  
    // Test for adding a new building by landlord 1
    it('should add a new building owned by a landlord', (done) => {
      chai
        .request(`http://localhost:${PORT}`)
        .post('/landlord/addBuilding')
        .send({
          userID: '64873c12bd2e5989a5e90e1c',
          buildingName: 'hftest2',
          address: '123 Sample St',
          postalCode: '666',
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 200);
          expect(res.body).to.have.property('message', 'Building added successfully');
          done();
        });
    });
  
    // Test for updating service ticket progress
    it('should update the progress of a service ticket for a landlord', (done) => {
      const sampleServiceTicketID = '64c5fcfcaea880170d4a199c'; //  hefantest unit 1
      chai
        .request(`http://localhost:${PORT}`)
        .put('/landlord/updateServiceTicketProgress')
        .send({ _id: sampleServiceTicketID })
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  
    // Test for updating quotation
    it('should update the quotation for a service ticket', (done) => {
      const sampleServiceTicketID = '64c5fcfcaea880170d4a199c';
      const sampleQuotationUpdate = {
        serviceTicketID: sampleServiceTicketID,
        quotationRequired: true,
        quotationAmount: 420,
        quotationAttachmentPath: 'null',
        quotationUploadedToBy: 'hftest',
        completedBy: 'hftest',
      };
      chai
        .request(`http://localhost:${PORT}`)
        .put('/landlord/updateQuotation')
        .send(sampleQuotationUpdate)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 200);
          expect(res.body).to.have.property('message', 'Quotation updated!');
          done();
        });
    });
  
    // Test for getting available lease information
    it('should get information about available leases', (done) => {
      chai
        .request(`http://localhost:${PORT}`)
        .get('/landlord/availableLease')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.text).to.be.a('string');
          done();
        });
    });
  });


  // Sample test data for unit tests
const sampleTenantInfo = {
  unitRef: 'sampleUnitRef',
  landlordRef: 'sampleLandlordRef',
};

const sampleBuildingData = {
  userID: 'sampleUserID',
  buildingName: 'Sample Building',
  address: '123 Sample St',
  postalCode: '12345',
};