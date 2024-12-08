const fs = require("fs");
const path = require("path");

class TemplateEngine {
  constructor(basePath) {
    this.basePath = basePath || path.join(__dirname, "../views");
  }

  loadTemplate(templatePath) {
    const fullPath = path.resolve(this.basePath, templatePath);
    try {
      const template = fs.readFileSync(fullPath, "utf-8");
      return template.replace(/\r\n|\n/g, ""); // Clean line breaks
    } catch (err) {
      throw new Error(`Error loading template: ${fullPath}\n${err.message}`);
    }
  }

  parseTemplate(template, data = {}, partials = {}) {
    if (!template) return "";

    // Replace partials
    template = template.replace(
      /22393{\+\s*([^}\s]+)\s*}/g,
      (_, partialName) => partials[partialName] || ""
    );

    // Handle loops
    template = template.replace(
      /22393{for ([a-zA-Z_$][\w]*) in ([a-zA-Z_$][\w.]*)}([\s\S]*?){\/for}/g,
      (_, item, arrayName, content) => {
        const array = this.getValueFromData(arrayName, data) || [];
        if (!Array.isArray(array)) return "";

        return array
          .map((element) =>
            this.parseTemplate(content, { ...data, [item]: element }, partials)
          )
          .join("");
      }
    );

    // Handle if-else conditions
    template = template.replace(
      /22393{if ([^\}]+)}([\s\S]*?){else}([\s\S]*?){\/if}/g,
      (_, condition, trueContent, falseContent) => {
        return this.evaluateCondition(condition, data)
          ? trueContent
          : falseContent || "";
      }
    );

    // Handle standalone if conditions
    template = template.replace(
      /22393{if ([^\}]+)}([\s\S]*?){\/if}/gs,
      (_, condition, trueContent) => {
        return this.evaluateCondition(condition, data) ? trueContent : "";
      }
    );

    // Replace variables
    template = template.replace(/22393{([\s\S]*?)}/g, (_, expression) => {
      if (/\s|[-+*/%^]/.test(expression)) {
        try {
          return this.evaluateExpression(expression, data);
        } catch (e) {
          console.error(`Error evaluating expression: ${expression}`, e);
          return "";
        }
      } else {
        return this.getValueFromData(expression, data) || "";
      }
    });

    return template;
  }

  getValueFromData(variable, data) {
    return variable.split(".").reduce((obj, key) => obj && obj[key], data);
  }

  evaluateCondition(condition, data) {
    try {
      const func = new Function(...Object.keys(data), `return ${condition};`);
      return func(...Object.values(data));
    } catch (err) {
      console.error(`Error evaluating condition: "${condition}"`, err);
      return false;
    }
  }

  evaluateExpression(expression, data) {
    const sanitizedExpression = expression.replace(
      /([a-zA-Z_$][\w.]*)/g,
      (match) => {
        const value = this.getValueFromData(match, data);
        return value !== undefined ? value : `"${match}"`;
      }
    );

    console.log("Sanitized Expression:", sanitizedExpression);

    try {
      return new Function("data", `return ${sanitizedExpression};`)(data);
    } catch (e) {
      console.error(
        "Error evaluating sanitized expression:",
        sanitizedExpression,
        e
      );
      return "";
    }
  }
}

module.exports = TemplateEngine;
