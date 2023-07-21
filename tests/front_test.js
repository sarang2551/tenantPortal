const {Builder, By, Key, until} = require('selenium-webdriver')

// Test plan 1: 1. Login as a tenant, 2. Add a service ticket, 3. Update the newly added service ticket 4. Logout
async function add_and_update_test(){
    let driver = await new Builder().forBrowser("chrome").build()
    await driver.manage().window().maximize(); 
    await driver.get("http://localhost:3000/") // go to login page
    await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[1]/input")), 10000);
    await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[1]/div/div[1]/input")).click()
    // type in username
    await driver.findElement(By.name("username")).sendKeys("test1",Key.RETURN)
    // type in password
    await driver.findElement(By.name("password")).sendKeys("test123",Key.RETURN)
    // submit login form
    //await driver.findElement(By.xpath("/html/body/div/div/div/div[3]/form/div[4]/button")).click()
    
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


add_and_update_test()