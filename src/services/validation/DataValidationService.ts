export interface ValidationRule {
    field: string;
    type: 'number' | 'string' | 'boolean' | 'object';
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    errors: {
      field: string;
      message: string;
    }[];
  }
  
  export class DataValidationService {
    private rules: Map<string, ValidationRule[]> = new Map();
  
    constructor() {
      this.setupDefaultRules();
    }
  
    private setupDefaultRules(): void {
      // Price data validation rules
      this.addRules('price', [
        {
          field: 'value',
          type: 'number',
          required: true,
          min: 0,
          custom: (value) => !isNaN(value) && isFinite(value)
        },
        {
          field: 'timestamp',
          type: 'number',
          required: true,
          custom: (value) => value > 0 && value <= Date.now()
        }
      ]);
  
      // Prediction data validation rules
      this.addRules('prediction', [
        {
          field: 'value',
          type: 'number',
          required: true,
          custom: (value) => !isNaN(value) && isFinite(value)
        },
        {
          field: 'confidence',
          type: 'number',
          required: true,
          min: 0,
          max: 100
        }
      ]);
  
      // Market data validation rules
      this.addRules('market', [
        {
          field: 'symbol',
          type: 'string',
          required: true,
          pattern: /^[A-Z0-9]+$/
        },
        {
          field: 'volume',
          type: 'number',
          required: true,
          min: 0
        }
      ]);
    }
  
    addRules(type: string, rules: ValidationRule[]): void {
      this.rules.set(type, rules);
    }
  
    validate(type: string, data: any): ValidationResult {
      const rules = this.rules.get(type);
      if (!rules) {
        return {
          isValid: false,
          errors: [{ field: 'type', message: `No validation rules found for type: ${type}` }]
        };
      }
  
      const errors: { field: string; message: string }[] = [];
  
      rules.forEach(rule => {
        const value = data[rule.field];
  
        // Check required
        if (rule.required && (value === undefined || value === null)) {
          errors.push({
            field: rule.field,
            message: `${rule.field} is required`
          });
          return;
        }
  
        if (value === undefined || value === null) {
          return;
        }
  
        // Type checking
        if (typeof value !== rule.type) {
          errors.push({
            field: rule.field,
            message: `${rule.field} must be of type ${rule.type}`
          });
          return;
        }
  
        // Number range checking
        if (rule.type === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be greater than or equal to ${rule.min}`
            });
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push({
              field: rule.field,
              message: `${rule.field} must be less than or equal to ${rule.max}`
            });
          }
        }
  
        // Pattern matching
        if (rule.pattern && rule.type === 'string' && !rule.pattern.test(value)) {
          errors.push({
            field: rule.field,
            message: `${rule.field} does not match required pattern`
          });
        }
  
        // Custom validation
        if (rule.custom && !rule.custom(value)) {
          errors.push({
            field: rule.field,
            message: `${rule.field} failed custom validation`
          });
        }
      });
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    validateBatch(type: string, dataArray: any[]): ValidationResult[] {
      return dataArray.map(data => this.validate(type, data));
    }
  
    validateStream(type: string, data: any): boolean {
      const result = this.validate(type, data);
      if (!result.isValid) {
        console.warn('Data validation failed:', result.errors);
      }
      return result.isValid;
    }
  }