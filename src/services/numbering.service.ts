/**
 * Numbering Engine Service
 * Conforms to PRD Section 26
 * Handles token replacement and sequence progression:
 * {YEAR}, {MONTH}, {DAY}, {COMPANY}, {PREFIX}, {SEQUENCE}
 */

import { NumberingRule, Company } from '../types';

export function generateDocumentNumber(
  rule: NumberingRule,
  company: Company,
  date: Date = new Date(),
  peekOnly: boolean = false
): { documentNumber: string; nextSequence: number } {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const seqNum = peekOnly ? rule.current_sequence : rule.current_sequence + 1;
  const sequenceStr = seqNum.toString().padStart(rule.sequence_length || 4, '0');
  
  const companyCode = (company.company_code || 'COMP').toUpperCase();
  const prefix = (rule.prefix || (rule.document_type === 'invoice' ? company.invoice_prefix : company.delivery_order_prefix) || 'DOC').toUpperCase();

  let formatted = rule.pattern || '{PREFIX}/{YEAR}/{MONTH}/{SEQUENCE}';
  
  formatted = formatted.replace(/{YEAR}/g, year);
  formatted = formatted.replace(/{MONTH}/g, month);
  formatted = formatted.replace(/{DAY}/g, day);
  formatted = formatted.replace(/{COMPANY}/g, companyCode);
  formatted = formatted.replace(/{PREFIX}/g, prefix);
  formatted = formatted.replace(/{SEQUENCE}/g, sequenceStr);

  return {
    documentNumber: formatted,
    nextSequence: seqNum,
  };
}

export function previewNumberPattern(
  pattern: string,
  prefix: string,
  companyCode: string,
  seq: number = 1,
  seqLength: number = 4
): string {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const sequenceStr = seq.toString().padStart(seqLength, '0');

  let res = pattern;
  res = res.replace(/{YEAR}/g, year);
  res = res.replace(/{MONTH}/g, month);
  res = res.replace(/{DAY}/g, day);
  res = res.replace(/{COMPANY}/g, companyCode.toUpperCase() || 'COMP');
  res = res.replace(/{PREFIX}/g, prefix.toUpperCase() || 'INV');
  res = res.replace(/{SEQUENCE}/g, sequenceStr);
  return res;
}
