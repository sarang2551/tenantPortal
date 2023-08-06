//for testing we will be using chrome browser
// use npx mocha --no-timeouts 'tests/*.js' to run the tests
const {Builder, By, Key, until} = require('selenium-webdriver')
var should = require("chai").should();

function generateRandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const minLength = 5;
    const maxLength = 15;
  
    const randomLength = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let randomString = '';
  
    for (let i = 0; i < randomLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
  
    return randomString;
  }

function delay(time) { // time is in ms
    return new Promise(resolve => setTimeout(resolve, time));
  }

async function landlord_login(driver){
    await driver.manage().window().maximize(); 
    await driver.get("http://localhost:3000/")
    //click on button to login as landlord
    await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[2]/input")).click()
    // type in username
    await driver.findElement(By.name("username")).sendKeys("landlord_1",Key.RETURN)
    // type in password
    await driver.findElement(By.name("password")).sendKeys("test1234",Key.RETURN)
    // submit login form
    await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[4]/button")).click() 

}

async function tenant_login(driver){
    await driver.manage().window().maximize(); 
    await driver.get("http://localhost:3000/")
    //click on button to login as tenant
    await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[1]/input")).click()
    // type in username
    await driver.findElement(By.name("username")).sendKeys("test1",Key.RETURN)
    // type in password
    await driver.findElement(By.name("password")).sendKeys("test123",Key.RETURN)
    // submit login form
    await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[4]/button")).click() 
}


// Test plan 1: 1. Login as a tenant, 2. Add a service ticket, 3. Update the newly added service ticket 4. Logout
async function tenant_add_and_update_test(){
    let driver = await new Builder().forBrowser("chrome").build()
    await driver.manage().window().maximize(); 
    await driver.get("http://localhost:3000/") // go to login page
    await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[1]/input")), 10000);
    await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[2]/input")).click()
    // type in username
    await driver.findElement(By.name("username")).sendKeys("landlord_1",Key.RETURN)
    // type in password
    await driver.findElement(By.name("password")).sendKeys("test123",Key.RETURN)
    // submit login form
    await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[4]/button")).click()

    await driver.get("http://localhost:3000/serviceTicketPage");
    // click add button
    await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/div/div/div[1]/div[4]/div/div/span/button")), 10000);
    await driver.findElement(By.xpath("/html/body/div[1]/div/div/div/div[1]/div[4]/div/div/span/button")).click();
    // write a title - Wait for the input field to be visible and interactable
    await driver.wait(until.elementLocated(By.xpath("/html/body/div[4]/div/div/form/input[1]")), 10000);
    await driver.findElement(By.xpath("/html/body/div[4]/div/div/form/input[1]")).sendKeys("Service Ticket Title", Key.RETURN);

    // write a description - Wait for the input field to be visible and interactable
    await driver.wait(until.elementLocated(By.xpath("/html/body/div[4]/div/div/form/input[2]")), 10000);
    await driver.findElement(By.xpath("/html/body/div[4]/div/div/form/input[2]")).sendKeys("ST Description", Key.RETURN);

    await driver.get("http://localhost:3000/serviceTicketPage");
    // click check status button - Wait for the button to be clickable
    await driver.wait(until.elementsLocated(By.xpath("/html/body/div[1]/div/div/div/div[2]/div/div/div/table/tbody/tr[1]/td[4]/div/button")), 10000);
    await driver.findElement(By.xpath("/html/body/div[1]/div/div/div/div[2]/div/div/div/table/tbody/tr[1]/td[4]/div/button")).click();
    // press next button on modal - Wait for the button to be clickable
    
    await driver.wait(until.elementLocated(By.xpath("/html/body/div[4]/div/div/div/div[2]/div[2]/div/button")), 10000);
    
    const updateButton = await driver.findElement(By.xpath("/html/body/div[4]/div/div/div/div[2]/div[2]/div/button"));
    // Perform the click action
    await updateButton.click();
    // logout
    driver.close()
    
}

async function landlord_update_function(){
    let driver = await new Builder().forBrowser("chrome").build()
    await driver.manage().window().maximize(); 
    await driver.get("http://localhost:3000/") // go to login page

    // type in username
    await driver.findElement(By.name("username")).sendKeys("landlord_1",Key.RETURN)
    // type in password
    await driver.findElement(By.name("password")).sendKeys("test123",Key.RETURN)
}

//tenant_add_and_update_test()


//testing script starts here


describe("login tests",function(){
    it("landlord successfully login in", async function(){
        let driver = await new Builder().forBrowser("chrome").build()
        await driver.manage().window().maximize(); 
        await driver.get("http://localhost:3000/")
        //click on button to login as landlord
        await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[2]/input")).click()
        // type in username
        await driver.findElement(By.name("username")).sendKeys("landlord_1",Key.RETURN)
        // type in password
        await driver.findElement(By.name("password")).sendKeys("test1234",Key.RETURN)
        // submit login form
        await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[4]/button")).click()
        await delay(200); // give the test time to go to next page
        const logged_in = await driver.getCurrentUrl()
        logged_in.should.equal("http://localhost:3000/landlord/home")
        await driver.close()
        
    });

    it("tenant successfully login in for first time", async function(){
        let driver = await new Builder().forBrowser("chrome").build()
        await driver.manage().window().maximize(); 
        await driver.get("http://localhost:3000/")
        //click on button to login as tenant
        await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[1]/input")).click()
        // type in username
        await driver.findElement(By.name("username")).sendKeys("RC_0002",Key.RETURN)
        // type in password
        await driver.findElement(By.name("password")).sendKeys("test123",Key.RETURN)
        // submit login form
        await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[4]/button")).click() 
        await delay(200); // give the test time to go to next page
        const logged_in = await driver.getCurrentUrl()
        logged_in.should.equal("http://localhost:3000/tenant/firstLogin")
        await driver.close()
    });

    it("tenant successfully login subsequently", async function(){
        let driver = await new Builder().forBrowser("chrome").build()
        await driver.manage().window().maximize(); 
        await driver.get("http://localhost:3000/")
        //click on button to login as tenant
        await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[1]/input")).click()
        // type in username
        await driver.findElement(By.name("username")).sendKeys("test1",Key.RETURN)
        // type in password
        await driver.findElement(By.name("password")).sendKeys("test123",Key.RETURN)
        // submit login form
        await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[4]/button")).click() 
        await delay(200); // give the test time to go to next page
        const logged_in = await driver.getCurrentUrl()
        logged_in.should.equal("http://localhost:3000/tenant/home")
        await driver.close()
    });
    
    it("Either user fails to login in", async function(){
        let driver = await new Builder().forBrowser("chrome").build()
        await driver.manage().window().maximize(); 
        await driver.get("http://localhost:3000/")
        //click on button to login as landlord
        await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[2]/input")).click()
        // type in username
        await driver.findElement(By.name("username")).sendKeys("landlord_1",Key.RETURN)
        // type in password
        await driver.findElement(By.name("password")).sendKeys("fakepassword",Key.RETURN)
        // submit login form
        await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[4]/button")).click()
        await delay(200); // give the test time to go to next page
        const logged_in = await driver.getCurrentUrl()
        logged_in.should.equal("http://localhost:3000/")//remain on the same page
        await driver.close()
        
    });

});


describe("landlord managing tenants tests",function(){
    it("landlord wants to add a new building called companyINC", async function(){
        //use landlord_1 to test
        let driver = await new Builder().forBrowser("chrome").build()
        await landlord_login(driver)
        await delay(200);
        //go into manage tenants page
        await driver.findElement(By.xpath("/html/body/div/div/nav/div/div/div/div[4]/a")).click()
        await delay(200);
        //add building button
        await driver.findElement(By.xpath("/html/body/div[1]/div/div/div/div[2]/div/div[1]/div[4]/div/div/span[2]/button")).click()
        await delay(200);
        // type in buildingname
        await driver.findElement(By.name("buildingName")).sendKeys("companyINC",Key.RETURN)
        // type in address
        await driver.findElement(By.name("address")).sendKeys("testaddress",Key.RETURN)
        // type in postalcode
        await driver.findElement(By.name("postalCode")).sendKeys("testpostal",Key.RETURN)

        await driver.close()
    });
});

// describe("landlord quotation tests",function(){//theres an issue with the quotations button
//     it("landlord wants to see quotations and edit them", async function(){
//         //use landlord_1 to test
//         let driver = await new Builder().forBrowser("chrome").build()
//         await landlord_login(driver)
//         await delay(200);
//         //go into quotations page
//         await driver.findElement(By.xpath("/html/body/div/div/nav/div/div/div/div[3]/a")).click()
//         await delay(200);
//         //click on the first check status button
//         //await driver.findElement(By.xpath("/html/body/div[1]/div/div/div[2]/div/div/div/table/tbody/tr[1]/td[4]/div/button")).click()
//         await delay(200);
//     });
// });



describe("service ticket journey ",function(){
    it("tenant logs in and add a new service ticket called EXAMPLE", async function(){
        //use test1 tenant to test
        let driver = await new Builder().forBrowser("chrome").build()
        await tenant_login(driver)
        await delay(200);
        //go into serivce ticket page
        await driver.findElement(By.xpath("/html/body/div/div/nav/div/div/div/div[2]/a")).click()
        await delay(20000); //give this page 10 seconds to load as it takes quite long to get the data
        //click on the add new service ticket button
        await driver.findElement(By.xpath("/html/body/div[1]/div/div/div[2]/div[1]/div[4]/div/div/span/button")).click()
        await delay(2000)
        //add the title of service ticket and description
        await driver.findElement(By.xpath("/html/body/div[4]/div/div/form/input[1]")).sendKeys(("EXAMPLE",Key.RETURN))
        await driver.findElement(By.xpath("/html/body/div[4]/div/div/form/input[2]")).sendKeys(("EXAMPLEDESCRIPTION",Key.RETURN))
        //click submit
        await driver.findElement(By.xpath("/html/body/div[4]/div/div/form/button")).click()
        await delay(200)
        //await driver.findElement(By.xpath("/html/body/div[4]/div")).click()
        //await delay(20000); //wait for the page to update
        var title_check = await driver.findElement(By.xpath("/html/body/div[1]/div/div/div[2]/div[2]/div/div/div/table/tbody/tr[5]/td[2]")).getAttribute("value")
        title_check.should.equal("EXAMPLE");
        await driver.close()
    });

    it("check if request is sent to landlord", async function(){
        //use landlord_1 to test
        let driver = await new Builder().forBrowser("chrome").build()
        await landlord_login(driver)
        await delay(200);
        //go to Tenant requests
        await driver.findElement(By.xpath("/html/body/div/div/nav/div/div/div/div[2]/a")).click()
        await delay(20000); //wait for the page to update
        await driver.findElement(By.xpath("/html/body/div[1]/div/div/table/tfoot/tr/td/div/div[3]/span[4]/button")).click()
        var title_check = await driver.findElement(By.xpath("/html/body/div[1]/div/div/div[2]/div/div/div/table/tbody/tr[2]/td[1]")).getAttribute("value")
        title_check.should.equal("EXAMPLE");
        await driver.close()
    });

    it("tenant is able to remove service ticket", async function(){
        let driver = await new Builder().forBrowser("chrome").build()
        await tenant_login(driver)
        await delay(200);
        //go into serivce ticket page
        await driver.findElement(By.xpath("/html/body/div/div/nav/div/div/div/div[2]/a")).click()
        await delay(20000); //give this page 10 seconds to load as it takes quite long to get the data
        //click on the delete button for the EXAMPLE service ticket
        await driver.findElement(By.xpath("/html/body/div[1]/div/div/div[2]/div[2]/div/div/div/table/tbody/tr[5]/td[1]/div/button")).click()
        await delay(20000); //let the page update
        //check if its removed in tenant page by checking the last service ticket entry
        var check_removed = await driver.findElement(By.xpath("/html/body/div[1]/div/div/div[2]/div[2]/div/div/div/table/tbody/tr[last()]/td[2]")).getAttribute("value")
        check_removed.should.not.equal("EXAMPLE")
        await driver.close()
    });
}); 

describe("changing profile information", () => {
    it("tenant changing profile information fuzzing", async () => {
      let driver = await new Builder().forBrowser("chrome").build();
  
      try {
        await tenant_login(driver);
        await delay(2000);
        // go to profile page
        await driver.findElement(By.xpath("/html/body/div/div/nav/div/div[2]/div/div[3]/a")).click();
        await delay(2000);
        // click on changing profile information
        await driver.findElement(By.xpath("/html/body/div/div/div[2]/div/button[1]")).click();
        // add fuzzing information
        // add username
        await driver.findElement(By.xpath("/html/body/div/div/div[3]/div/div/form/div[2]/input[1]")).sendKeys(generateRandomString(), Key.RETURN);
        // add phone number
        await driver.findElement(By.xpath("/html/body/div/div/div[3]/div/div/form/div[2]/input[2]")).sendKeys(generateRandomString(), Key.RETURN);
        // add email
        await driver.findElement(By.xpath("/html/body/div/div/div[3]/div/div/form/div[2]/input[3]")).sendKeys(generateRandomString(), Key.RETURN);
  
        // Make sure the browser is closed after the operations are complete
        await driver.close();
      } catch (error) {
        // Handle any errors that occur during the test
        console.error("Test error:", error);
      } finally {
        // Ensure the test is completed
        done();
      }
    });

    it("landlord changing profile information fuzzing", async () => {
        let driver = await new Builder().forBrowser("chrome").build();
    
        try {
          await landlord_login(driver);
          await delay(2000);
          // go to profile page
          await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/nav/div/div[2]/div/div[4]/a")), 10000);
          await driver.findElement(By.xpath("/html/body/div/div/nav/div/div[2]/div/div[4]/a")).click();
          await delay(2000);
          // click on changing profile information
          await driver.findElement(By.xpath("/html/body/div/div/div[2]/div/button[1]")).click();
          // add fuzzing information
          // add username
          await driver.findElement(By.xpath("/html/body/div/div/div[3]/div/div/form/div[2]/input[1]")).sendKeys(generateRandomString(), Key.RETURN);
          // add phone number
          await driver.findElement(By.xpath("/html/body/div/div/div[3]/div/div/form/div[2]/input[2]")).sendKeys(generateRandomString(), Key.RETURN);
          // add email
          await driver.findElement(By.xpath("/html/body/div/div/div[3]/div/div/form/div[2]/input[3]")).sendKeys(generateRandomString(), Key.RETURN);
    
          // Make sure the browser is closed after the operations are complete
          await driver.close();
          process.exit(0)
        } catch (error) {
          // Handle any errors that occur during the test
          console.error("Test error:", error);
        } finally {
          // Ensure the test is completed
          done();
          
        }
      });
    
  });

  
  