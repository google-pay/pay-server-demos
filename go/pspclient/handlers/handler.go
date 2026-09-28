// Copyright 2026 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Package handlers implements one PSP integration per file. Each handler
// takes a PSP-specific config map and a *pspclient.Order, normalizes the order,
// and charges it.
package handlers

import (
	"errors"

	"github.com/google-pay/pay-server-demos/go/pspclient"
)

// Handler charges an order with a PSP, returning the PSP's raw response.
type Handler func(config map[string]interface{}, order *pspclient.Order) (interface{}, error)

// All is a registry of every handler in this package, keyed by PSP name,
// for callers that want to select a PSP by name at runtime.
var All = map[string]Handler{
	"adyen":       Adyen,
	"checkoutcom": CheckoutCom,
	"square":      Square,
	"stripe":      Stripe,
}

func requireConfig(config map[string]interface{}) error {
	if config == nil {
		return errors.New("config not provided")
	}
	return nil
}

func str(config map[string]interface{}, key string) string {
	if v, ok := config[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}
