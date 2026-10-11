import { Locator, Page, expect } from '@playwright/test';
import { step } from '../../utilities/logging';
import { Constants } from '../../utilities/constants';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Runs `action`, waits for the native browser alert it triggers, accepts it
   * and returns its message. The listener is attached *before* the action so
   * the alert can never be missed or auto-dismissed, and a missing alert fails
   * the test instead of passing silently.
   */
  @step('Capture browser alert')
  async acceptDialogDuring(action: () => Promise<unknown>): Promise<string> {
    // Accept as soon as the alert opens: an alert raised synchronously by a click
    // blocks the page, so the click itself only resolves after the alert is closed.
    const accepted = this.page.waitForEvent('dialog', { timeout: Constants.TIMEOUTS.DIALOG })
      .then(async dialog => {
        const message = dialog.message();
        await dialog.accept();
        return message;
      });
    const [message] = await Promise.all([accepted, action()]);
    return message;
  }

  @step('Navigate to URL')
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  @step('click on element ')
  async clickElement(element: Locator): Promise<void> {
    await element.waitFor({ state: 'visible' });
    await element.click();
  }

  @step('Force click to element ')
  async forceClickModal(element: Locator): Promise<void> {
    await element.waitFor({ state: 'visible' });
    await element.click({ force: true });
  }

  @step('Check the checkbox')
  async checkTheCheckbox(
    element: Locator,
    isChecked: boolean = true
  ): Promise<void> {
    const currentState = await element.isChecked();
    if (currentState !== isChecked) {
      await this.scrollToElement(element);
      await element.check();
      if (isChecked) {
        await expect(element).toBeChecked();
      } else {
        await expect(element).not.toBeChecked();
      }
    }
  }

  protected async scrollToElement(element: Locator): Promise<void> {
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Fills and verifies the value stuck. Bootstrap moves focus to a modal when its
   * opening animation ends; on WebKit that can swallow text typed at that moment.
   */
  @step('fill element with value')
  async fillElement(element: Locator, value: string): Promise<void> {
    await expect(async () => {
      await element.fill(value);
      await expect(element).toHaveValue(value, { timeout: 1000 });
    }).toPass({ timeout: Constants.TIMEOUTS.ACTION });
  }

  /** Waits until a Bootstrap modal has finished its fade-in, not just started it. */
  @step('Wait for modal to be fully shown')
  async waitForModalShown(modal: Locator): Promise<void> {
    await expect(modal).toBeVisible();
    await expect(modal).toHaveCSS('opacity', '1');
  }

  @step('Wail until element clickable')
  async waitUntilClickable(locator: Locator) {
    await locator.waitFor({ state: 'visible' });
    await expect(locator).toBeEnabled();
  }


  @step('get element inner text')
  async getElementInnerText(element: Locator): Promise<string> {
    return (await element.innerText()) ?? '';
  }

  @step('get element text content')
  async getElementTextContent(element: Locator): Promise<string> {
    return (await element.textContent()) ?? '';
  }

  @step('wait for element with selector to be visible')
  async waitForElement(selector: string): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    return element;
  }

  protected async waitForElementVisible(
    element: Locator | string
  ): Promise<void> {
    if (typeof element === 'string') {
      await this.page.waitForSelector(element, { state: 'visible' });
    } else {
      await element.waitFor({ state: 'visible' });
    }
  }

  protected async waitForElementHidden(
    element: Locator | string,
    timeout: number = 30
  ): Promise<void> {
    if (typeof element === 'string') {
      await this.page.waitForSelector(element, {
        state: 'hidden',
        timeout: timeout * 1000,
      });
    } else {
      await element.waitFor({ state: 'hidden', timeout: timeout * 1000 });
    }
  }

  @step('take screenshot with file name')
  async takeScreenshot(fileName: string): Promise<void> {
    await this.page.screenshot({ path: fileName });
  }

  @step('capture screenshot')
  async captureScreenshot(
    screenshotName: string,
    fullPage: boolean = false
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `screenshots/${screenshotName}-${timestamp}.png`,
      fullPage,
    });
  }

  @step('get current page URL')
  async getUrl(): Promise<string> {
    return this.page.url();
  }

  @step('select dropdown')
  async selectDropdownOption(locator: string, option: string): Promise<void> {
    await this.page.locator(locator).selectOption(option);
  }

  @step('check the box')
  async checkCheckbox(locator: string): Promise<void> {
    await this.page.locator(locator).check();
    await expect(this.page.locator(locator)).toBeChecked();
  }

  @step('is checkbox checked')
  async isCheckboxChecked(locator: string): Promise<void> {
    await expect(this.page.locator(locator)).toBeChecked();
  }

  @step('uncheck the checkbox')
  async uncheckCheckbox(locator: string): Promise<void> {
    await this.page.locator(locator).uncheck();
    await expect(this.page.locator(locator)).not.toBeChecked();
  }
  @step('is checkbox unchecked')
  async isCheckboxUnchecked(locator: string): Promise<void> {
    await expect(this.page.locator(locator)).not.toBeChecked();
  }

  @step('wait for page loaded')
  async waitForPageLoaded(): Promise<void> {
    await this.page.waitForLoadState();
  }

  @step('focus the element')
  async focusElement(locator: string): Promise<void> {
    await this.page.locator(locator).focus();
  }

  @step('Get Attribute Value')
  async getAttribute(
    locator: Locator,
    attribute: string = 'value'
  ): Promise<string> {
    return (await locator.first().getAttribute(attribute)) ?? '';
  }

  @step('Clear Text Field')
  async clear(locator: Locator): Promise<void> {
    await locator.fill('');
  }

  @step('Check Locator is visible or not')
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible();
  }

  @step('Check Locator is enabled or not')
  async isEnabled(locator: Locator): Promise<boolean> {
    return await locator.isEnabled();
  }

  @step('Check Locator is editable or not')
  async isEditable(locator: Locator): Promise<boolean> {
    return await locator.isEditable();
  }

  @step('Scroll an element into view')
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  @step('Get Text Content of Locator')
  async textContent(locator: Locator, trim: boolean = true): Promise<string> {
    const content = (await locator.first().textContent()) ?? '';
    return trim ? content.trim() : content;
  }

  @step('Get Inner Text of Locator')
  async innerText(locator: Locator): Promise<string> {
    return (await locator.first().innerText())?.trim() ?? '';
  }

  @step('Close Browser')
  async closeBrowser(): Promise<void> {
    await this.page.close();
  }

  @step('Check if Locator is Checked')
  async isChecked(locator: Locator): Promise<boolean> {
    return await locator.isChecked();
  }

  @step('Select Option from Dropdown')
  async selectOption(
    locator: Locator,
    option: string | string[]
  ): Promise<void> {
    await this.waitForVisible(locator);
    await locator.selectOption(option);
  }

  @step('Wait Locator with visible state')
  async waitForVisible(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
  }

  @step('Exxpect Title contains text')
  async expectTitleContains(text: string) {
    await expect(this.page).toHaveTitle(new RegExp(text));
  }
}
