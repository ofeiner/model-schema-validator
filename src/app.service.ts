import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  validateTrafficData(
    modelSchemata: Array<object>,
    trafficData: Array<object>,
  ) {
    const results = new Array<object>();
    trafficData.map((entry) => {
      const matchedSchema = modelSchemata.filter(
        (schema) =>
          schema['path'] === entry['path'] &&
          schema['method'] === entry['method'],
      );
      let isValid = false;
      if (matchedSchema && matchedSchema.length > 0) {
        isValid = this.validateSingleTrafficDatapoint(entry, matchedSchema[0]);
      }
      results.push({
        entry: entry,
        isValid: isValid,
      });
    });
    return results;
  }
  private validateSingleTrafficDatapoint(data: object, schema: object) {
    delete schema['path'];
    delete schema['method'];
    delete data['path'];
    delete data['method'];
    const schemaKeys = Object.keys(schema);
    schemaKeys.map((schemaKey) => {
      if (Object.keys(data).includes(schemaKey)) {
        if (schema[schemaKey].length != 0) {
          return this.validateSingleFeature(data[schemaKey], schema[schemaKey]);
        }
      } else return false;
    });
    return true;
  }

  private validateSingleFeature(datum: Array<object>, feature: Array<object>) {
    feature.map((subFeature) => {
      if (subFeature['required'] == true) {
        const subDatum = datum.find(
          (sub) => sub['name'] === subFeature['name'],
        );
        if (
          subDatum === undefined ||
          !this.validateFeatureParticle(subDatum, subFeature)
        )
          return false;
      }
    });
    return true;
  }

  private validateFeatureParticle(subDatum: object, subFeature: object) {
    let isValid = true;
    const value = subDatum['value'];
    const valueType = typeof value;
    const allowedTypes = subFeature['types'];
    allowedTypes.map((aType) => {
      switch (aType) {
        case 'Boolean':
          isValid = isValid && valueType === 'boolean';
          break;
        case 'String':
          isValid = isValid && valueType === 'string';
          break;
        case 'List':
          isValid = isValid && valueType === 'object' && Array.isArray(value);
          break;
        case 'Int':
          isValid = isValid && valueType === 'number';
          break;
        case 'Date':
          isValid = isValid && this.isValidDate(value);
          break;
        case 'Email':
          isValid =
            isValid &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).toLowerCase());
          break;
        case 'UUID':
          isValid =
            isValid &&
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              String(value),
            );
          break;
        case 'Auth-Token':
          isValid =
            isValid &&
            /Bearer\s[\d|a-f]{8}-([\d|a-f]{4}-){3}[\d|a-f]{12}/.test(
              String(value),
            );
          break;
        default:
          break;
      }
    });
    return isValid;
  }
  private isValidDate(dateString) {
    // First check for the pattern
    if (!/^\d{1,2}-\d{1,2}-\d{4}$/.test(dateString)) return false;

    // Parse the date parts to integers
    const parts = dateString.split('-');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if (year < 1000 || year > 3000 || month == 0 || month > 12) return false;

    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Adjust for leap years
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
      monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
  }
}
