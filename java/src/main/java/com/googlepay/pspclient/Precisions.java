/*
 * Copyright 2026 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.googlepay.pspclient;

import java.util.HashMap;
import java.util.Map;

/** ISO standard currency codes and their minor-unit precisions. */
public final class Precisions {

  private static final Map<String, Integer> PRECISIONS = new HashMap<>();

  static {
    PRECISIONS.put("AED", 2);
    PRECISIONS.put("AFN", 2);
    PRECISIONS.put("AMD", 2);
    PRECISIONS.put("ANG", 2);
    PRECISIONS.put("AOA", 2);
    PRECISIONS.put("ARS", 2);
    PRECISIONS.put("AUD", 2);
    PRECISIONS.put("AWG", 2);
    PRECISIONS.put("AZN", 2);
    PRECISIONS.put("BAM", 2);
    PRECISIONS.put("BBD", 2);
    PRECISIONS.put("BDT", 2);
    PRECISIONS.put("BGN", 2);
    PRECISIONS.put("BHD", 3);
    PRECISIONS.put("BIF", 0);
    PRECISIONS.put("BMD", 2);
    PRECISIONS.put("BND", 2);
    PRECISIONS.put("BOB", 2);
    PRECISIONS.put("BRL", 2);
    PRECISIONS.put("BSD", 2);
    PRECISIONS.put("BWP", 2);
    PRECISIONS.put("BYR", 0);
    PRECISIONS.put("BYN", 2);
    PRECISIONS.put("BZD", 2);
    PRECISIONS.put("CAD", 2);
    PRECISIONS.put("CDF", 2);
    PRECISIONS.put("CHF", 2);
    PRECISIONS.put("CLP", 0);
    PRECISIONS.put("CNY", 2);
    PRECISIONS.put("COP", 2);
    PRECISIONS.put("CRC", 2);
    PRECISIONS.put("CSK", 2);
    PRECISIONS.put("CVE", 2);
    PRECISIONS.put("CZK", 2);
    PRECISIONS.put("DJF", 0);
    PRECISIONS.put("DKK", 2);
    PRECISIONS.put("DOP", 2);
    PRECISIONS.put("DZD", 2);
    PRECISIONS.put("EGP", 2);
    PRECISIONS.put("ERN", 2);
    PRECISIONS.put("ETB", 2);
    PRECISIONS.put("EUR", 2);
    PRECISIONS.put("FJD", 2);
    PRECISIONS.put("FKP", 2);
    PRECISIONS.put("GBP", 2);
    PRECISIONS.put("GEL", 2);
    PRECISIONS.put("GHS", 2);
    PRECISIONS.put("GIP", 2);
    PRECISIONS.put("GMD", 2);
    PRECISIONS.put("GNF", 0);
    PRECISIONS.put("GTQ", 2);
    PRECISIONS.put("GWP", 0);
    PRECISIONS.put("GYD", 2);
    PRECISIONS.put("HKD", 2);
    PRECISIONS.put("HNL", 2);
    PRECISIONS.put("HRK", 2);
    PRECISIONS.put("HTG", 2);
    PRECISIONS.put("HUF", 2);
    PRECISIONS.put("IDR", 2);
    PRECISIONS.put("ILS", 2);
    PRECISIONS.put("INR", 2);
    PRECISIONS.put("IQD", 3);
    PRECISIONS.put("ISK", 2);
    PRECISIONS.put("JMD", 2);
    PRECISIONS.put("JOD", 3);
    PRECISIONS.put("JPY", 0);
    PRECISIONS.put("KES", 2);
    PRECISIONS.put("KGS", 2);
    PRECISIONS.put("KHR", 2);
    PRECISIONS.put("KMF", 0);
    PRECISIONS.put("KRW", 0);
    PRECISIONS.put("KWD", 3);
    PRECISIONS.put("KYD", 2);
    PRECISIONS.put("KZT", 2);
    PRECISIONS.put("LAK", 2);
    PRECISIONS.put("LBP", 2);
    PRECISIONS.put("LKR", 2);
    PRECISIONS.put("LRD", 2);
    PRECISIONS.put("LSL", 2);
    PRECISIONS.put("LTL", 2);
    PRECISIONS.put("LVL", 2);
    PRECISIONS.put("MAD", 2);
    PRECISIONS.put("MDL", 2);
    PRECISIONS.put("MGA", 0);
    PRECISIONS.put("MKD", 2);
    PRECISIONS.put("MMK", 2);
    PRECISIONS.put("MNT", 2);
    PRECISIONS.put("MOP", 2);
    PRECISIONS.put("MRO", 2);
    PRECISIONS.put("MUR", 2);
    PRECISIONS.put("MVR", 2);
    PRECISIONS.put("MWK", 2);
    PRECISIONS.put("MXN", 2);
    PRECISIONS.put("MYR", 2);
    PRECISIONS.put("MZN", 2);
    PRECISIONS.put("NAD", 2);
    PRECISIONS.put("NGN", 2);
    PRECISIONS.put("NIO", 2);
    PRECISIONS.put("NOK", 2);
    PRECISIONS.put("NPR", 2);
    PRECISIONS.put("NZD", 2);
    PRECISIONS.put("OMR", 3);
    PRECISIONS.put("PAB", 2);
    PRECISIONS.put("PEN", 2);
    PRECISIONS.put("PGK", 2);
    PRECISIONS.put("PHP", 2);
    PRECISIONS.put("PKR", 2);
    PRECISIONS.put("PLN", 2);
    PRECISIONS.put("PYG", 0);
    PRECISIONS.put("QAR", 2);
    PRECISIONS.put("RON", 2);
    PRECISIONS.put("RSD", 2);
    PRECISIONS.put("RUB", 2);
    PRECISIONS.put("RWF", 0);
    PRECISIONS.put("SAR", 2);
    PRECISIONS.put("SBD", 2);
    PRECISIONS.put("SCR", 2);
    PRECISIONS.put("SEK", 2);
    PRECISIONS.put("SGD", 2);
    PRECISIONS.put("SHP", 2);
    PRECISIONS.put("SLL", 2);
    PRECISIONS.put("SOS", 2);
    PRECISIONS.put("SRD", 2);
    PRECISIONS.put("SSP", 2);
    PRECISIONS.put("STD", 2);
    PRECISIONS.put("SYP", 2);
    PRECISIONS.put("SZL", 2);
    PRECISIONS.put("THB", 2);
    PRECISIONS.put("TJS", 2);
    PRECISIONS.put("TND", 3);
    PRECISIONS.put("TOP", 2);
    PRECISIONS.put("TRY", 2);
    PRECISIONS.put("TTD", 2);
    PRECISIONS.put("TWD", 2);
    PRECISIONS.put("TZS", 2);
    PRECISIONS.put("UAH", 2);
    PRECISIONS.put("UGX", 2);
    PRECISIONS.put("USD", 2);
    PRECISIONS.put("UYU", 2);
    PRECISIONS.put("UZS", 2);
    PRECISIONS.put("VEF", 2);
    PRECISIONS.put("VND", 0);
    PRECISIONS.put("VUV", 0);
    PRECISIONS.put("WST", 2);
    PRECISIONS.put("XAF", 0);
    PRECISIONS.put("XCD", 2);
    PRECISIONS.put("XOF", 0);
    PRECISIONS.put("XPF", 0);
    PRECISIONS.put("YER", 2);
    PRECISIONS.put("ZAR", 2);
    PRECISIONS.put("ZMK", 2);
    PRECISIONS.put("ZMW", 2);
    PRECISIONS.put("ZWD", 2);
  }

  private Precisions() {}

  /** Returns the number of minor-unit decimal places for the given ISO currency code, or null if unknown. */
  public static Integer get(String currencyCode) {
    return currencyCode == null ? null : PRECISIONS.get(currencyCode);
  }
}
