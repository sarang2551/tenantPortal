const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
const PORT =8000
describe('Tenant Authentication and Registration API', () => {
  it('should return 200 OK when valid credentials are provided for tenant login', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .post('/tenant/tenantLogin')
      .send({ username: 'Dylan', password: 'test123' })
      .end((err, res) => {
        // Now, check the response and the status code.
        expect(res).to.have.status(200);
        // Add more assertions here if needed.
        done(); // Call done to indicate test completion
      });
  });
  it('should return 401  when invalid credentials are provided for tenant login', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .post('/tenant/tenantLogin')
      .send({ username: 'testuser2', password: 'testpassword2' })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done(); 
      });
  });

});

//Additional tenant

describe('Tenant Routes', () => {
  const valid_user_id = 'va64cfeae14afa49ebe4d602e0'
  const serviceTicketid = '64cffba09c31c65a4cfbde46'


  it('should add a new service ticket', (done) => {
    chai
      .request(`http://localhost:${PORT}`)
      .post('/tenant/addServiceTicket')
      .send({ userID: valid_user_id, tenantName: 'John Doe', unit: 'Unit 101' })
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
      .send({ _id: serviceTicketid })//test2 service ticket
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
      .get(`/tenant/getUnitData/${valid_user_id}`)
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
      .get(`/tenant/getAllServiceTickets/${valid_user_id}`)
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
      .send({ _id: 'valid_service_ticket_id' })
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
      .get('/tenant/getUnit&LandlordData/valid_user_id')
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
      .send({ serviceTicketID: 'valid_service_ticket_id', feedbackRating: 4 })
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
      .send({ serviceTicketID: 'valid_service_ticket_id', quotationAcceptedbyTenant: true })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status').to.equal(200);
        expect(res.body).to.have.property('message').to.equal('Quotation Accepted');
        done();
      });
  });
});



// Landlord tests

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
          unitRef: 'sampleUnitRef',
          landlordRef: 'sampleLandlordRef',
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 200);
          expect(res.body).to.have.property('message', 'Tenant added successfully');
          done();
        });
    });
  
    // Test for adding a unit
    it('should add a new unit to a building', (done) => {
      chai
        .request(`http://localhost:${PORT}`)
        .post('/landlord/addUnit')
        .send({
          unitNumber: '101',
          buildingID: 'sampleBuildingID',
          monthlyRental: 1000,
          userID: 'sampleLandlordID',
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
      const sampleUserID = 'sampleLandlordID';
      chai
        .request(`http://localhost:${PORT}`)
        .get(`/landlord/getAllServiceTickets/${sampleUserID}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  
    // Test for getting all buildings owned by a landlord
    it('should get all buildings owned by a landlord', (done) => {
      const sampleUserID = 'sampleLandlordID';
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
      const sampleBuildingID = 'sampleBuildingID';
      chai
        .request(`http://localhost:${PORT}`)
        .get(`/landlord/getBuildingInformation/${sampleBuildingID}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('status', 200);
          expect(res.body).to.have.property('unitsList');
          done();
        });
    });
  
    // Test for getting tenant information
    it('should get information about a specific tenant', (done) => {
      const sampleTenantID = 'sampleTenantID';
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
  
    // Test for adding a new building
    it('should add a new building owned by a landlord', (done) => {
      chai
        .request(`http://localhost:${PORT}`)
        .post('/landlord/addBuilding')
        .send({
          userID: 'sampleUserID',
          buildingName: 'Sample Building',
          address: '123 Sample St',
          postalCode: '12345',
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
      const sampleServiceTicketID = 'sampleServiceTicketID';
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
      const sampleServiceTicketID = 'sampleServiceTicketID';
      const sampleQuotationUpdate = {
        serviceTicketID: sampleServiceTicketID,
        quotationRequired: true,
        quotationAmount: 200,
        quotationAttachmentPath: 'path/to/quotation.pdf',
        quotationUploadedToBy: 'sampleUser',
        completedBy: 'sampleUser',
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