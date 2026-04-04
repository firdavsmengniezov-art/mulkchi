import { browser, by, element, protractor, ElementFinder, $ } from 'protractor';

describe('Saved Searches E2E Tests', () => {
  const baseUrl = 'http://localhost:4200';
  
  beforeEach(() => {
    // Navigate to login page
    browser.get(`${baseUrl}/login`);
    
    // Login with test credentials
    element(by.css('input[formcontrolname="email"]')).sendKeys('test@example.com');
    element(by.css('input[formcontrolname="password"]')).sendKeys('Test123!');
    element(by.css('button[type="submit"]')).click();
    
    // Wait for login to complete
    browser.wait(protractor.ExpectedConditions.urlContains('/dashboard'), 10000);
  });

  describe('Saved Searches List', () => {
    beforeEach(() => {
      // Navigate to saved searches page
      browser.get(`${baseUrl}/saved-searches`);
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-list'))), 5000);
    });

    it('should display saved searches page correctly', () => {
      // Check page title
      expect(element(by.css('h1')).getText()).toBe('Saqlangan qidiruvlar');
      
      // Check page description
      expect(element(by.css('.page-header p')).getText()).toContain('O\'zing qidiruv parametrlarini saqlang');
    });

    it('should show empty state when no saved searches exist', () => {
      // Check empty state elements
      expect(element(by.css('.empty-state')).isPresent()).toBe(true);
      expect(element(by.css('.empty-icon')).getText()).toBe('🔍');
      expect(element(by.css('.empty-state h3')).getText()).toBe('Hali qidiruvlar saqlanmagan');
    });

    it('should create new saved search', () => {
      // Click create new search button
      element(by.css('a[routerlink="/saved-searches/new"]')).click();
      
      // Wait for form to load
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-form'))), 5000);
      
      // Fill in the form
      element(by.css('input[formcontrolname="name"]')).sendKeys('Toshkent kvartiralari');
      element(by.css('input[formcontrolname="city"]')).sendKeys('Toshkent');
      element(by.css('select[formcontrolname="type"]')).element(by.cssContainingText('option', 'Kvartira')).click();
      element(by.css('select[formcontrolname="listingType"]')).element(by.cssContainingText('option', 'Ijara')).click();
      element(by.css('input[formcontrolname="minPrice"]')).sendKeys('5000000');
      element(by.css('input[formcontrolname="maxPrice"]')).sendKeys('15000000');
      element(by.css('input[formcontrolname="minArea"]')).sendKeys('50');
      element(by.css('input[formcontrolname="maxArea"]')).sendKeys('100');
      element(by.css('input[formcontrolname="minBedrooms"]')).sendKeys('2');
      
      // Submit the form
      element(by.css('button[type="submit"]')).click();
      
      // Wait for success message
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.alert-success'))), 5000);
      
      // Check success message
      expect(element(by.css('.alert-success')).getText()).toContain('Qidiruv muvaffaqiyatli saqlandi!');
      
      // Navigate back to list
      browser.get(`${baseUrl}/saved-searches`);
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-list'))), 5000);
      
      // Check that the new search appears in the list
      expect(element(by.css('.searches-list')).isPresent()).toBe(true);
      expect(element(by.css('.search-card h4')).getText()).toBe('Toshkent kvartiralari');
    });

    it('should display saved search details correctly', async () => {
      // Create a test search first
      await createTestSearch();
      
      // Navigate back to list
      browser.get(`${baseUrl}/saved-searches`);
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-list'))), 5000);
      
      // Check search card elements
      const searchCard = element(by.css('.search-card'));
      expect(searchCard.isPresent()).toBe(true);
      
      // Check search name
      expect(searchCard.element(by.css('h4')).getText()).toBe('Test qidiruv');
      
      // Check search summary
      expect(searchCard.element(by.css('.search-summary')).getText()).toContain('Shahar: Toshkent');
      
      // Check status toggle
      expect(searchCard.element(by.css('.status-toggle')).isPresent()).toBe(true);
      
      // Check notification settings
      expect(searchCard.element(by.css('.search-details')).getText()).toContain('Bildirishlar:');
      
      // Check action buttons
      expect(searchCard.element(by.cssContainingText('button', 'Qidirish')).isPresent()).toBe(true);
      expect(searchCard.element(by.cssContainingText('button', 'Tahrirlash')).isPresent()).toBe(true);
      expect(searchCard.element(by.cssContainingText('button', 'O\'chirish')).isPresent()).toBe(true);
    });

    it('should toggle saved search status', async () => {
      // Create a test search first
      await createTestSearch();
      
      // Navigate back to list
      browser.get(`${baseUrl}/saved-searches`);
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-list'))), 5000);
      
      // Get initial status
      const statusToggle = element(by.css('.status-toggle input[type="checkbox"]'));
      const initialStatus = await statusToggle.isSelected();
      
      // Click the toggle
      statusToggle.click();
      
      // Wait for status to update
      browser.sleep(1000);
      
      // Check that status changed
      const newStatus = await statusToggle.isSelected();
      expect(newStatus).not.toBe(initialStatus);
    });

    it('should edit saved search', async () => {
      // Create a test search first
      await createTestSearch();
      
      // Navigate back to list
      browser.get(`${baseUrl}/saved-searches`);
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-list'))), 5000);
      
      // Click edit button
      element(by.cssContainingText('button', 'Tahrirlash')).click();
      
      // Wait for form to load
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-form'))), 5000);
      
      // Check that form is populated with existing data
      expect(element(by.css('input[formcontrolname="name"]')).getAttribute('value')).toBe('Test qidiruv');
      expect(element(by.css('input[formcontrolname="city"]')).getAttribute('value')).toBe('Toshkent');
      
      // Update the form
      element(by.css('input[formcontrolname="name"]')).clear();
      element(by.css('input[formcontrolname="name"]')).sendKeys('Yangilangan qidiruv');
      
      // Submit the form
      element(by.css('button[type="submit"]')).click();
      
      // Wait for success message
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.alert-success'))), 5000);
      
      // Check success message
      expect(element(by.css('.alert-success')).getText()).toContain('Qidiruv muvaffaqiyatli yangilandi!');
      
      // Navigate back to list
      browser.get(`${baseUrl}/saved-searches`);
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-list'))), 5000);
      
      // Check that the updated name appears in the list
      expect(element(by.css('.search-card h4')).getText()).toBe('Yangilangan qidiruv');
    });

    it('should delete saved search', async () => {
      // Create a test search first
      await createTestSearch();
      
      // Navigate back to list
      browser.get(`${baseUrl}/saved-searches`);
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-list'))), 5000);
      
      // Click delete button
      element(by.cssContainingText('button', 'O\'chirish')).click();
      
      // Wait for confirmation dialog (if implemented)
      browser.sleep(500);
      
      // Confirm deletion (if confirmation dialog exists)
      const confirmButton = element(by.cssContainingText('button', 'Ha') || by.cssContainingText('button', 'Yes'));
      if (confirmButton.isPresent()) {
        confirmButton.click();
      }
      
      // Wait for list to update
      browser.sleep(1000);
      
      // Check that the search is no longer in the list
      expect(element(by.css('.empty-state')).isPresent()).toBe(true);
    });

    it('should validate form inputs', () => {
      // Navigate to create new search
      browser.get(`${baseUrl}/saved-searches/new`);
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-form'))), 5000);
      
      // Try to submit empty form
      element(by.css('button[type="submit"]')).click();
      
      // Check validation error for required field
      expect(element(by.css('.error')).getText()).toContain('Qidiruv nomi kiritilishi shart');
      
      // Fill in only the name
      element(by.css('input[formcontrolname="name"]')).sendKeys('Test qidiruv');
      
      // Submit form again
      element(by.css('button[type="submit"]')).click();
      
      // Check that form submits successfully
      browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.alert-success'))), 5000);
      expect(element(by.css('.alert-success')).getText()).toContain('Qidiruv muvaffaqiyatli saqlandi!');
    });
  });

  // Helper function to create a test search
  async function createTestSearch(): Promise<void> {
    browser.get(`${baseUrl}/saved-searches/new`);
    browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.saved-search-form'))), 5000);
    
    element(by.css('input[formcontrolname="name"]')).sendKeys('Test qidiruv');
    element(by.css('input[formcontrolname="city"]')).sendKeys('Toshkent');
    element(by.css('select[formcontrolname="type"]')).element(by.cssContainingText('option', 'Kvartira')).click();
    element(by.css('select[formcontrolname="listingType"]')).element(by.cssContainingText('option', 'Ijara')).click();
    element(by.css('input[formcontrolname="minPrice"]')).sendKeys('5000000');
    element(by.css('input[formcontrolname="maxPrice"]')).sendKeys('15000000');
    element(by.css('input[formcontrolname="minArea"]')).sendKeys('50');
    element(by.css('input[formcontrolname="maxArea"]')).sendKeys('100');
    element(by.css('input[formcontrolname="minBedrooms"]')).sendKeys('2');
    
    element(by.css('button[type="submit"]')).click();
    browser.wait(protractor.ExpectedConditions.presenceOf(element(by.css('.alert-success'))), 5000);
  }
});
