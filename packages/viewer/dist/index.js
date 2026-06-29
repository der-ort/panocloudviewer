import * as THREE5 from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import React25, { createContext, lazy, useContext, useState, useCallback, useEffect, useRef, useReducer, useMemo, Suspense } from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { X, ChevronDown, ChevronUp, Check, Download, Settings, Sliders, Layers, Sun, Moon, BoxSelect, Move, Maximize2, RotateCw, Plus, Trash2, Scissors, ScissorsLineDashed, Power, Eye, EyeOff, RotateCcw, Search, Navigation, CloudCog, Ruler, Upload, Bookmark, Play, Camera, Box, Tag, ChevronRight, ChevronLeft, Slice, MapPin, ArrowUpDown, Pentagon, Package, Triangle, Waypoints, Map as Map$1, Globe, Orbit, Rotate3d, Maximize, Palette, Square, Image, Circle, Minus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { cva } from 'class-variance-authority';
import * as SliderPrimitive from '@radix-ui/react-slider';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as SelectPrimitive from '@radix-ui/react-select';

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/global.js
function global_default(defs2) {
  defs2("EPSG:4326", "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees");
  defs2("EPSG:4269", "+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees");
  defs2("EPSG:3857", "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");
  for (var i = 1; i <= 60; ++i) {
    defs2("EPSG:" + (32600 + i), "+proj=utm +zone=" + i + " +datum=WGS84 +units=m");
    defs2("EPSG:" + (32700 + i), "+proj=utm +zone=" + i + " +south +datum=WGS84 +units=m");
  }
  defs2("EPSG:5041", "+title=WGS 84 / UPS North (E,N) +proj=stere +lat_0=90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m");
  defs2("EPSG:5042", "+title=WGS 84 / UPS South (E,N) +proj=stere +lat_0=-90 +lon_0=0 +k=0.994 +x_0=2000000 +y_0=2000000 +datum=WGS84 +units=m");
  defs2.WGS84 = defs2["EPSG:4326"];
  defs2["EPSG:3785"] = defs2["EPSG:3857"];
  defs2.GOOGLE = defs2["EPSG:3857"];
  defs2["EPSG:900913"] = defs2["EPSG:3857"];
  defs2["EPSG:102113"] = defs2["EPSG:3857"];
}
var init_global = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/global.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/values.js
var PJD_3PARAM, PJD_7PARAM, PJD_GRIDSHIFT, PJD_WGS84, PJD_NODATUM, SRS_WGS84_SEMIMAJOR, SRS_WGS84_SEMIMINOR, SRS_WGS84_ESQUARED, SEC_TO_RAD, HALF_PI, SIXTH, RA4, RA6, EPSLN, D2R, R2D, FORTPI, TWO_PI, SPI;
var init_values = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/values.js"() {
    PJD_3PARAM = 1;
    PJD_7PARAM = 2;
    PJD_GRIDSHIFT = 3;
    PJD_WGS84 = 4;
    PJD_NODATUM = 5;
    SRS_WGS84_SEMIMAJOR = 6378137;
    SRS_WGS84_SEMIMINOR = 6356752314e-3;
    SRS_WGS84_ESQUARED = 0.0066943799901413165;
    SEC_TO_RAD = 484813681109536e-20;
    HALF_PI = Math.PI / 2;
    SIXTH = 0.16666666666666666;
    RA4 = 0.04722222222222222;
    RA6 = 0.022156084656084655;
    EPSLN = 1e-10;
    D2R = 0.017453292519943295;
    R2D = 57.29577951308232;
    FORTPI = Math.PI / 4;
    TWO_PI = Math.PI * 2;
    SPI = 3.14159265359;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/PrimeMeridian.js
var primeMeridian, PrimeMeridian_default;
var init_PrimeMeridian = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/PrimeMeridian.js"() {
    primeMeridian = {};
    primeMeridian.greenwich = 0;
    primeMeridian.lisbon = -9.131906111111;
    primeMeridian.paris = 2.337229166667;
    primeMeridian.bogota = -74.080916666667;
    primeMeridian.madrid = -3.687938888889;
    primeMeridian.rome = 12.452333333333;
    primeMeridian.bern = 7.439583333333;
    primeMeridian.jakarta = 106.807719444444;
    primeMeridian.ferro = -17.666666666667;
    primeMeridian.brussels = 4.367975;
    primeMeridian.stockholm = 18.058277777778;
    primeMeridian.athens = 23.7163375;
    primeMeridian.oslo = 10.722916666667;
    PrimeMeridian_default = primeMeridian;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/units.js
var units_default;
var init_units = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/units.js"() {
    units_default = {
      mm: { to_meter: 1e-3 },
      cm: { to_meter: 0.01 },
      ft: { to_meter: 0.3048 },
      "us-ft": { to_meter: 1200 / 3937 },
      fath: { to_meter: 1.8288 },
      kmi: { to_meter: 1852 },
      "us-ch": { to_meter: 20.1168402336805 },
      "us-mi": { to_meter: 1609.34721869444 },
      km: { to_meter: 1e3 },
      "ind-ft": { to_meter: 0.30479841 },
      "ind-yd": { to_meter: 0.91439523 },
      mi: { to_meter: 1609.344 },
      yd: { to_meter: 0.9144 },
      ch: { to_meter: 20.1168 },
      link: { to_meter: 0.201168 },
      dm: { to_meter: 0.1 },
      in: { to_meter: 0.0254 },
      "ind-ch": { to_meter: 20.11669506 },
      "us-in": { to_meter: 0.025400050800101 },
      "us-yd": { to_meter: 0.914401828803658 }
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/match.js
function match(obj, key) {
  if (obj[key]) {
    return obj[key];
  }
  var keys = Object.keys(obj);
  var lkey = key.toLowerCase().replace(ignoredChar, "");
  var i = -1;
  var testkey, processedKey;
  while (++i < keys.length) {
    testkey = keys[i];
    processedKey = testkey.toLowerCase().replace(ignoredChar, "");
    if (processedKey === lkey) {
      return obj[testkey];
    }
  }
}
var ignoredChar;
var init_match = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/match.js"() {
    ignoredChar = /[\s_\-\/\(\)]/g;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projString.js
function projString_default(defData) {
  var self = {};
  var paramObj = defData.split("+").map(function(v) {
    return v.trim();
  }).filter(function(a) {
    return a;
  }).reduce(function(p, a) {
    var split = a.split("=");
    split.push(true);
    p[split[0].toLowerCase()] = split[1];
    return p;
  }, {});
  var paramName, paramVal, paramOutname;
  var params2 = {
    proj: "projName",
    datum: "datumCode",
    rf: function(v) {
      self.rf = parseFloat(v);
    },
    lat_0: function(v) {
      self.lat0 = v * D2R;
    },
    lat_1: function(v) {
      self.lat1 = v * D2R;
    },
    lat_2: function(v) {
      self.lat2 = v * D2R;
    },
    lat_ts: function(v) {
      self.lat_ts = v * D2R;
    },
    lon_0: function(v) {
      self.long0 = v * D2R;
    },
    lon_1: function(v) {
      self.long1 = v * D2R;
    },
    lon_2: function(v) {
      self.long2 = v * D2R;
    },
    alpha: function(v) {
      self.alpha = parseFloat(v) * D2R;
    },
    gamma: function(v) {
      self.rectified_grid_angle = parseFloat(v) * D2R;
    },
    lonc: function(v) {
      self.longc = v * D2R;
    },
    x_0: function(v) {
      self.x0 = parseFloat(v);
    },
    y_0: function(v) {
      self.y0 = parseFloat(v);
    },
    k_0: function(v) {
      self.k0 = parseFloat(v);
    },
    k: function(v) {
      self.k0 = parseFloat(v);
    },
    a: function(v) {
      self.a = parseFloat(v);
    },
    b: function(v) {
      self.b = parseFloat(v);
    },
    r: function(v) {
      self.a = self.b = parseFloat(v);
    },
    r_a: function() {
      self.R_A = true;
    },
    zone: function(v) {
      self.zone = parseInt(v, 10);
    },
    south: function() {
      self.utmSouth = true;
    },
    towgs84: function(v) {
      self.datum_params = v.split(",").map(function(a) {
        return parseFloat(a);
      });
    },
    to_meter: function(v) {
      self.to_meter = parseFloat(v);
    },
    units: function(v) {
      self.units = v;
      var unit = match(units_default, v);
      if (unit) {
        self.to_meter = unit.to_meter;
      }
    },
    from_greenwich: function(v) {
      self.from_greenwich = v * D2R;
    },
    pm: function(v) {
      var pm = match(PrimeMeridian_default, v);
      self.from_greenwich = (pm ? pm : parseFloat(v)) * D2R;
    },
    nadgrids: function(v) {
      if (v === "@null") {
        self.datumCode = "none";
      } else {
        self.nadgrids = v;
      }
    },
    axis: function(v) {
      var legalAxis = "ewnsud";
      if (v.length === 3 && legalAxis.indexOf(v.substr(0, 1)) !== -1 && legalAxis.indexOf(v.substr(1, 1)) !== -1 && legalAxis.indexOf(v.substr(2, 1)) !== -1) {
        self.axis = v;
      }
    },
    approx: function() {
      self.approx = true;
    },
    over: function() {
      self.over = true;
    }
  };
  for (paramName in paramObj) {
    paramVal = paramObj[paramName];
    if (paramName in params2) {
      paramOutname = params2[paramName];
      if (typeof paramOutname === "function") {
        paramOutname(paramVal);
      } else {
        self[paramOutname] = paramVal;
      }
    } else {
      self[paramName] = paramVal;
    }
  }
  if (typeof self.datumCode === "string" && self.datumCode !== "WGS84") {
    self.datumCode = self.datumCode.toLowerCase();
  }
  self["projStr"] = defData;
  return self;
}
var init_projString = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projString.js"() {
    init_values();
    init_PrimeMeridian();
    init_units();
    init_match();
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/PROJJSONBuilderBase.js
var PROJJSONBuilderBase, PROJJSONBuilderBase_default;
var init_PROJJSONBuilderBase = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/PROJJSONBuilderBase.js"() {
    PROJJSONBuilderBase = class {
      static getId(node) {
        const idNode = node.find((child) => Array.isArray(child) && child[0] === "ID");
        if (idNode && idNode.length >= 3) {
          return {
            authority: idNode[1],
            code: parseInt(idNode[2], 10)
          };
        }
        return null;
      }
      static convertUnit(node, type = "unit") {
        if (!node || node.length < 3) {
          return { type, name: "unknown", conversion_factor: null };
        }
        const name = node[1];
        const conversionFactor = parseFloat(node[2]) || null;
        const idNode = node.find((child) => Array.isArray(child) && child[0] === "ID");
        const id = idNode ? {
          authority: idNode[1],
          code: parseInt(idNode[2], 10)
        } : null;
        return {
          type,
          name,
          conversion_factor: conversionFactor,
          id
        };
      }
      static convertAxis(node) {
        const name = node[1] || "Unknown";
        let direction;
        const abbreviationMatch = name.match(/^\((.)\)$/);
        if (abbreviationMatch) {
          const abbreviation = abbreviationMatch[1].toUpperCase();
          if (abbreviation === "E") direction = "east";
          else if (abbreviation === "N") direction = "north";
          else if (abbreviation === "U") direction = "up";
          else if (node[2]) direction = node[2];
          else throw new Error(`Unknown axis abbreviation: ${abbreviation}`);
        } else {
          direction = node[2] || "unknown";
        }
        const orderNode = node.find((child) => Array.isArray(child) && child[0] === "ORDER");
        const order2 = orderNode ? parseInt(orderNode[1], 10) : null;
        const unitNode = node.find(
          (child) => Array.isArray(child) && (child[0] === "LENGTHUNIT" || child[0] === "ANGLEUNIT" || child[0] === "SCALEUNIT")
        );
        const unit = this.convertUnit(unitNode);
        return {
          name,
          direction,
          // Use the valid PROJJSON direction value
          unit,
          order: order2
        };
      }
      static extractAxes(node) {
        return node.filter((child) => Array.isArray(child) && child[0] === "AXIS").map((axis) => this.convertAxis(axis)).sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      static convert(node, result = {}) {
        switch (node[0]) {
          case "PROJCRS":
            result.type = "ProjectedCRS";
            result.name = node[1];
            result.base_crs = node.find((child) => Array.isArray(child) && child[0] === "BASEGEOGCRS") ? this.convert(node.find((child) => Array.isArray(child) && child[0] === "BASEGEOGCRS")) : null;
            result.conversion = node.find((child) => Array.isArray(child) && child[0] === "CONVERSION") ? this.convert(node.find((child) => Array.isArray(child) && child[0] === "CONVERSION")) : null;
            const csNode = node.find((child) => Array.isArray(child) && child[0] === "CS");
            if (csNode) {
              result.coordinate_system = {
                type: csNode[1],
                axis: this.extractAxes(node)
              };
            }
            const lengthUnitNode = node.find((child) => Array.isArray(child) && child[0] === "LENGTHUNIT");
            if (lengthUnitNode) {
              const unit2 = this.convertUnit(lengthUnitNode);
              result.coordinate_system.unit = unit2;
            }
            result.id = this.getId(node);
            break;
          case "BASEGEOGCRS":
          case "GEOGCRS":
          case "GEODCRS":
            result.type = node[0] === "GEODCRS" ? "GeodeticCRS" : "GeographicCRS";
            result.name = node[1];
            const datumOrEnsembleNode = node.find(
              (child) => Array.isArray(child) && (child[0] === "DATUM" || child[0] === "ENSEMBLE")
            );
            if (datumOrEnsembleNode) {
              const datumOrEnsemble = this.convert(datumOrEnsembleNode);
              if (datumOrEnsembleNode[0] === "ENSEMBLE") {
                result.datum_ensemble = datumOrEnsemble;
              } else {
                result.datum = datumOrEnsemble;
              }
              const primem = node.find((child) => Array.isArray(child) && child[0] === "PRIMEM");
              if (primem && primem[1] !== "Greenwich") {
                datumOrEnsemble.prime_meridian = {
                  name: primem[1],
                  longitude: parseFloat(primem[2])
                };
              }
            }
            result.coordinate_system = {
              type: "ellipsoidal",
              axis: this.extractAxes(node)
            };
            result.id = this.getId(node);
            break;
          case "DATUM":
            result.type = "GeodeticReferenceFrame";
            result.name = node[1];
            result.ellipsoid = node.find((child) => Array.isArray(child) && child[0] === "ELLIPSOID") ? this.convert(node.find((child) => Array.isArray(child) && child[0] === "ELLIPSOID")) : null;
            break;
          case "ENSEMBLE":
            result.type = "DatumEnsemble";
            result.name = node[1];
            result.members = node.filter((child) => Array.isArray(child) && child[0] === "MEMBER").map((member) => ({
              type: "DatumEnsembleMember",
              name: member[1],
              id: this.getId(member)
              // Extract ID as { authority, code }
            }));
            const accuracyNode = node.find((child) => Array.isArray(child) && child[0] === "ENSEMBLEACCURACY");
            if (accuracyNode) {
              result.accuracy = parseFloat(accuracyNode[1]);
            }
            const ellipsoidNode = node.find((child) => Array.isArray(child) && child[0] === "ELLIPSOID");
            if (ellipsoidNode) {
              result.ellipsoid = this.convert(ellipsoidNode);
            }
            result.id = this.getId(node);
            break;
          case "ELLIPSOID":
            result.type = "Ellipsoid";
            result.name = node[1];
            result.semi_major_axis = parseFloat(node[2]);
            result.inverse_flattening = parseFloat(node[3]);
            node.find((child) => Array.isArray(child) && child[0] === "LENGTHUNIT") ? this.convert(node.find((child) => Array.isArray(child) && child[0] === "LENGTHUNIT"), result) : null;
            break;
          case "CONVERSION":
            result.type = "Conversion";
            result.name = node[1];
            result.method = node.find((child) => Array.isArray(child) && child[0] === "METHOD") ? this.convert(node.find((child) => Array.isArray(child) && child[0] === "METHOD")) : null;
            result.parameters = node.filter((child) => Array.isArray(child) && child[0] === "PARAMETER").map((param) => this.convert(param));
            break;
          case "METHOD":
            result.type = "Method";
            result.name = node[1];
            result.id = this.getId(node);
            break;
          case "PARAMETER":
            result.type = "Parameter";
            result.name = node[1];
            result.value = parseFloat(node[2]);
            result.unit = this.convertUnit(
              node.find(
                (child) => Array.isArray(child) && (child[0] === "LENGTHUNIT" || child[0] === "ANGLEUNIT" || child[0] === "SCALEUNIT")
              )
            );
            result.id = this.getId(node);
            break;
          case "BOUNDCRS":
            result.type = "BoundCRS";
            const sourceCrsNode = node.find((child) => Array.isArray(child) && child[0] === "SOURCECRS");
            if (sourceCrsNode) {
              const sourceCrsContent = sourceCrsNode.find((child) => Array.isArray(child));
              result.source_crs = sourceCrsContent ? this.convert(sourceCrsContent) : null;
            }
            const targetCrsNode = node.find((child) => Array.isArray(child) && child[0] === "TARGETCRS");
            if (targetCrsNode) {
              const targetCrsContent = targetCrsNode.find((child) => Array.isArray(child));
              result.target_crs = targetCrsContent ? this.convert(targetCrsContent) : null;
            }
            const transformationNode = node.find((child) => Array.isArray(child) && child[0] === "ABRIDGEDTRANSFORMATION");
            if (transformationNode) {
              result.transformation = this.convert(transformationNode);
            } else {
              result.transformation = null;
            }
            break;
          case "ABRIDGEDTRANSFORMATION":
            result.type = "Transformation";
            result.name = node[1];
            result.method = node.find((child) => Array.isArray(child) && child[0] === "METHOD") ? this.convert(node.find((child) => Array.isArray(child) && child[0] === "METHOD")) : null;
            result.parameters = node.filter((child) => Array.isArray(child) && (child[0] === "PARAMETER" || child[0] === "PARAMETERFILE")).map((param) => {
              if (param[0] === "PARAMETER") {
                return this.convert(param);
              } else if (param[0] === "PARAMETERFILE") {
                return {
                  name: param[1],
                  value: param[2],
                  id: {
                    "authority": "EPSG",
                    "code": 8656
                  }
                };
              }
            });
            if (result.parameters.length === 7) {
              const scaleDifference = result.parameters[6];
              if (scaleDifference.name === "Scale difference") {
                scaleDifference.value = Math.round((scaleDifference.value - 1) * 1e12) / 1e6;
              }
            }
            result.id = this.getId(node);
            break;
          case "AXIS":
            if (!result.coordinate_system) {
              result.coordinate_system = { type: "unspecified", axis: [] };
            }
            result.coordinate_system.axis.push(this.convertAxis(node));
            break;
          case "LENGTHUNIT":
            const unit = this.convertUnit(node, "LinearUnit");
            if (result.coordinate_system && result.coordinate_system.axis) {
              result.coordinate_system.axis.forEach((axis) => {
                if (!axis.unit) {
                  axis.unit = unit;
                }
              });
            }
            if (unit.conversion_factor && unit.conversion_factor !== 1) {
              if (result.semi_major_axis) {
                result.semi_major_axis = {
                  value: result.semi_major_axis,
                  unit
                };
              }
            }
            break;
          default:
            result.keyword = node[0];
            break;
        }
        return result;
      }
    };
    PROJJSONBuilderBase_default = PROJJSONBuilderBase;
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/PROJJSONBuilder2015.js
var PROJJSONBuilder2015, PROJJSONBuilder2015_default;
var init_PROJJSONBuilder2015 = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/PROJJSONBuilder2015.js"() {
    init_PROJJSONBuilderBase();
    PROJJSONBuilder2015 = class extends PROJJSONBuilderBase_default {
      static convert(node, result = {}) {
        super.convert(node, result);
        if (result.coordinate_system && result.coordinate_system.subtype === "Cartesian") {
          delete result.coordinate_system;
        }
        if (result.usage) {
          delete result.usage;
        }
        return result;
      }
    };
    PROJJSONBuilder2015_default = PROJJSONBuilder2015;
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/PROJJSONBuilder2019.js
var PROJJSONBuilder2019, PROJJSONBuilder2019_default;
var init_PROJJSONBuilder2019 = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/PROJJSONBuilder2019.js"() {
    init_PROJJSONBuilderBase();
    PROJJSONBuilder2019 = class extends PROJJSONBuilderBase_default {
      static convert(node, result = {}) {
        super.convert(node, result);
        const csNode = node.find((child) => Array.isArray(child) && child[0] === "CS");
        if (csNode) {
          result.coordinate_system = {
            subtype: csNode[1],
            axis: this.extractAxes(node)
          };
        }
        const usageNode = node.find((child) => Array.isArray(child) && child[0] === "USAGE");
        if (usageNode) {
          const scope = usageNode.find((child) => Array.isArray(child) && child[0] === "SCOPE");
          const area = usageNode.find((child) => Array.isArray(child) && child[0] === "AREA");
          const bbox = usageNode.find((child) => Array.isArray(child) && child[0] === "BBOX");
          result.usage = {};
          if (scope) {
            result.usage.scope = scope[1];
          }
          if (area) {
            result.usage.area = area[1];
          }
          if (bbox) {
            result.usage.bbox = bbox.slice(1);
          }
        }
        return result;
      }
    };
    PROJJSONBuilder2019_default = PROJJSONBuilder2019;
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/buildPROJJSON.js
function detectWKT2Version(root) {
  if (root.find((child) => Array.isArray(child) && child[0] === "USAGE")) {
    return "2019";
  }
  if (root.find((child) => Array.isArray(child) && child[0] === "CS")) {
    return "2015";
  }
  if (root[0] === "BOUNDCRS" || root[0] === "PROJCRS" || root[0] === "GEOGCRS") {
    return "2015";
  }
  return "2015";
}
function buildPROJJSON(root) {
  const version = detectWKT2Version(root);
  const builder = version === "2019" ? PROJJSONBuilder2019_default : PROJJSONBuilder2015_default;
  return builder.convert(root);
}
var init_buildPROJJSON = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/buildPROJJSON.js"() {
    init_PROJJSONBuilder2015();
    init_PROJJSONBuilder2019();
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/detectWKTVersion.js
function detectWKTVersion(wkt) {
  const normalizedWKT = wkt.toUpperCase();
  if (normalizedWKT.includes("PROJCRS") || normalizedWKT.includes("GEOGCRS") || normalizedWKT.includes("BOUNDCRS") || normalizedWKT.includes("VERTCRS") || normalizedWKT.includes("LENGTHUNIT") || normalizedWKT.includes("ANGLEUNIT") || normalizedWKT.includes("SCALEUNIT")) {
    return "WKT2";
  }
  if (normalizedWKT.includes("PROJCS") || normalizedWKT.includes("GEOGCS") || normalizedWKT.includes("LOCAL_CS") || normalizedWKT.includes("VERT_CS") || normalizedWKT.includes("UNIT")) {
    return "WKT1";
  }
  return "WKT1";
}
var init_detectWKTVersion = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/detectWKTVersion.js"() {
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/parser.js
function Parser(text) {
  if (typeof text !== "string") {
    throw new Error("not a string");
  }
  this.text = text.trim();
  this.level = 0;
  this.place = 0;
  this.root = null;
  this.stack = [];
  this.currentObject = null;
  this.state = NEUTRAL;
}
function parseString(txt) {
  var parser = new Parser(txt);
  return parser.output();
}
var parser_default, NEUTRAL, KEYWORD, NUMBER, QUOTED, AFTERQUOTE, ENDED, whitespace, latin, keyword, endThings, digets;
var init_parser = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/parser.js"() {
    parser_default = parseString;
    NEUTRAL = 1;
    KEYWORD = 2;
    NUMBER = 3;
    QUOTED = 4;
    AFTERQUOTE = 5;
    ENDED = -1;
    whitespace = /\s/;
    latin = /[A-Za-z]/;
    keyword = /[A-Za-z84_]/;
    endThings = /[,\]]/;
    digets = /[\d\.E\-\+]/;
    Parser.prototype.readCharicter = function() {
      var char = this.text[this.place++];
      if (this.state !== QUOTED) {
        while (whitespace.test(char)) {
          if (this.place >= this.text.length) {
            return;
          }
          char = this.text[this.place++];
        }
      }
      switch (this.state) {
        case NEUTRAL:
          return this.neutral(char);
        case KEYWORD:
          return this.keyword(char);
        case QUOTED:
          return this.quoted(char);
        case AFTERQUOTE:
          return this.afterquote(char);
        case NUMBER:
          return this.number(char);
        case ENDED:
          return;
      }
    };
    Parser.prototype.afterquote = function(char) {
      if (char === '"') {
        this.word += '"';
        this.state = QUOTED;
        return;
      }
      if (endThings.test(char)) {
        this.word = this.word.trim();
        this.afterItem(char);
        return;
      }
      throw new Error(`havn't handled "` + char + '" in afterquote yet, index ' + this.place);
    };
    Parser.prototype.afterItem = function(char) {
      if (char === ",") {
        if (this.word !== null) {
          this.currentObject.push(this.word);
        }
        this.word = null;
        this.state = NEUTRAL;
        return;
      }
      if (char === "]") {
        this.level--;
        if (this.word !== null) {
          this.currentObject.push(this.word);
          this.word = null;
        }
        this.state = NEUTRAL;
        this.currentObject = this.stack.pop();
        if (!this.currentObject) {
          this.state = ENDED;
        }
        return;
      }
    };
    Parser.prototype.number = function(char) {
      if (digets.test(char)) {
        this.word += char;
        return;
      }
      if (endThings.test(char)) {
        this.word = parseFloat(this.word);
        this.afterItem(char);
        return;
      }
      throw new Error(`havn't handled "` + char + '" in number yet, index ' + this.place);
    };
    Parser.prototype.quoted = function(char) {
      if (char === '"') {
        this.state = AFTERQUOTE;
        return;
      }
      this.word += char;
      return;
    };
    Parser.prototype.keyword = function(char) {
      if (keyword.test(char)) {
        this.word += char;
        return;
      }
      if (char === "[") {
        var newObjects = [];
        newObjects.push(this.word);
        this.level++;
        if (this.root === null) {
          this.root = newObjects;
        } else {
          this.currentObject.push(newObjects);
        }
        this.stack.push(this.currentObject);
        this.currentObject = newObjects;
        this.state = NEUTRAL;
        return;
      }
      if (endThings.test(char)) {
        this.afterItem(char);
        return;
      }
      throw new Error(`havn't handled "` + char + '" in keyword yet, index ' + this.place);
    };
    Parser.prototype.neutral = function(char) {
      if (latin.test(char)) {
        this.word = char;
        this.state = KEYWORD;
        return;
      }
      if (char === '"') {
        this.word = "";
        this.state = QUOTED;
        return;
      }
      if (digets.test(char)) {
        this.word = char;
        this.state = NUMBER;
        return;
      }
      if (endThings.test(char)) {
        this.afterItem(char);
        return;
      }
      throw new Error(`havn't handled "` + char + '" in neutral yet, index ' + this.place);
    };
    Parser.prototype.output = function() {
      while (this.place < this.text.length) {
        this.readCharicter();
      }
      if (this.state === ENDED) {
        return this.root;
      }
      throw new Error('unable to parse string "' + this.text + '". State is ' + this.state);
    };
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/process.js
function mapit(obj, key, value) {
  if (Array.isArray(key)) {
    value.unshift(key);
    key = null;
  }
  var thing = key ? {} : obj;
  var out = value.reduce(function(newObj, item) {
    sExpr(item, newObj);
    return newObj;
  }, thing);
  if (key) {
    obj[key] = out;
  }
}
function sExpr(v, obj) {
  if (!Array.isArray(v)) {
    obj[v] = true;
    return;
  }
  var key = v.shift();
  if (key === "PARAMETER") {
    key = v.shift();
  }
  if (v.length === 1) {
    if (Array.isArray(v[0])) {
      obj[key] = {};
      sExpr(v[0], obj[key]);
      return;
    }
    obj[key] = v[0];
    return;
  }
  if (!v.length) {
    obj[key] = true;
    return;
  }
  if (key === "TOWGS84") {
    obj[key] = v;
    return;
  }
  if (key === "AXIS") {
    if (!(key in obj)) {
      obj[key] = [];
    }
    obj[key].push(v);
    return;
  }
  if (!Array.isArray(key)) {
    obj[key] = {};
  }
  var i;
  switch (key) {
    case "UNIT":
    case "PRIMEM":
    case "VERT_DATUM":
      obj[key] = {
        name: v[0].toLowerCase(),
        convert: v[1]
      };
      if (v.length === 3) {
        sExpr(v[2], obj[key]);
      }
      return;
    case "SPHEROID":
    case "ELLIPSOID":
      obj[key] = {
        name: v[0],
        a: v[1],
        rf: v[2]
      };
      if (v.length === 4) {
        sExpr(v[3], obj[key]);
      }
      return;
    case "EDATUM":
    case "ENGINEERINGDATUM":
    case "LOCAL_DATUM":
    case "DATUM":
    case "VERT_CS":
    case "VERTCRS":
    case "VERTICALCRS":
      v[0] = ["name", v[0]];
      mapit(obj, key, v);
      return;
    case "COMPD_CS":
    case "COMPOUNDCRS":
    case "FITTED_CS":
    // the followings are the crs defined in
    // https://github.com/proj4js/proj4js/blob/1da4ed0b865d0fcb51c136090569210cdcc9019e/lib/parseCode.js#L11
    case "PROJECTEDCRS":
    case "PROJCRS":
    case "GEOGCS":
    case "GEOCCS":
    case "PROJCS":
    case "LOCAL_CS":
    case "GEODCRS":
    case "GEODETICCRS":
    case "GEODETICDATUM":
    case "ENGCRS":
    case "ENGINEERINGCRS":
      v[0] = ["name", v[0]];
      mapit(obj, key, v);
      obj[key].type = key;
      return;
    default:
      i = -1;
      while (++i < v.length) {
        if (!Array.isArray(v[i])) {
          return sExpr(v, obj[key]);
        }
      }
      return mapit(obj, key, v);
  }
}
var init_process = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/process.js"() {
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/util.js
function d2r(input) {
  return input * D2R2;
}
function applyProjectionDefaults(wkt) {
  const normalizedProjName = (wkt.projName || "").toLowerCase().replace(/_/g, " ");
  if (wkt.long0 === void 0 && wkt.longc !== void 0) {
    wkt.long0 = wkt.longc;
  }
  if (!wkt.lat_ts && wkt.lat1 && (normalizedProjName === "stereographic south pole" || normalizedProjName === "polar stereographic (variant b)")) {
    wkt.lat0 = d2r(wkt.lat1 > 0 ? 90 : -90);
    wkt.lat_ts = wkt.lat1;
    delete wkt.lat1;
  } else if (!wkt.lat_ts && wkt.lat0 && (normalizedProjName === "polar stereographic" || normalizedProjName === "polar stereographic (variant a)")) {
    wkt.lat_ts = wkt.lat0;
    wkt.lat0 = d2r(wkt.lat0 > 0 ? 90 : -90);
    delete wkt.lat1;
  }
}
var D2R2;
var init_util = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/util.js"() {
    D2R2 = 0.017453292519943295;
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/transformPROJJSON.js
function processUnit(unit) {
  let result = { units: null, to_meter: void 0 };
  if (typeof unit === "string") {
    result.units = unit.toLowerCase();
    if (result.units === "metre") {
      result.units = "meter";
    }
    if (result.units === "meter") {
      result.to_meter = 1;
    }
  } else if (unit && unit.name) {
    result.units = unit.name.toLowerCase();
    if (result.units === "metre") {
      result.units = "meter";
    }
    result.to_meter = unit.conversion_factor;
  }
  return result;
}
function toValue(valueOrObject) {
  if (typeof valueOrObject === "object") {
    return valueOrObject.value * valueOrObject.unit.conversion_factor;
  }
  return valueOrObject;
}
function calculateEllipsoid(value, result) {
  if (value.ellipsoid.radius) {
    result.a = value.ellipsoid.radius;
    result.rf = 0;
  } else {
    result.a = toValue(value.ellipsoid.semi_major_axis);
    if (value.ellipsoid.inverse_flattening !== void 0) {
      result.rf = value.ellipsoid.inverse_flattening;
    } else if (value.ellipsoid.semi_major_axis !== void 0 && value.ellipsoid.semi_minor_axis !== void 0) {
      result.rf = result.a / (result.a - toValue(value.ellipsoid.semi_minor_axis));
    }
  }
}
function transformPROJJSON(projjson, result = {}) {
  if (!projjson || typeof projjson !== "object") {
    return projjson;
  }
  if (projjson.type === "BoundCRS") {
    transformPROJJSON(projjson.source_crs, result);
    if (projjson.transformation) {
      if (projjson.transformation.method && projjson.transformation.method.name === "NTv2") {
        result.nadgrids = projjson.transformation.parameters[0].value;
      } else {
        result.datum_params = projjson.transformation.parameters.map((param) => param.value);
      }
    }
    return result;
  }
  Object.keys(projjson).forEach((key) => {
    const value = projjson[key];
    if (value === null) {
      return;
    }
    switch (key) {
      case "name":
        if (result.srsCode) {
          break;
        }
        result.name = value;
        result.srsCode = value;
        break;
      case "type":
        if (value === "GeographicCRS") {
          result.projName = "longlat";
        } else if (value === "GeodeticCRS") {
          if (projjson.coordinate_system && projjson.coordinate_system.subtype === "Cartesian") {
            result.projName = "geocent";
          } else {
            result.projName = "longlat";
          }
        } else if (value === "ProjectedCRS" && projjson.conversion && projjson.conversion.method) {
          result.projName = projjson.conversion.method.name;
        }
        break;
      case "datum":
      case "datum_ensemble":
        if (value.ellipsoid) {
          result.ellps = value.ellipsoid.name;
          calculateEllipsoid(value, result);
        }
        if (value.prime_meridian) {
          result.from_greenwich = value.prime_meridian.longitude * Math.PI / 180;
        }
        break;
      case "ellipsoid":
        result.ellps = value.name;
        calculateEllipsoid(value, result);
        break;
      case "prime_meridian":
        result.long0 = (value.longitude || 0) * Math.PI / 180;
        break;
      case "coordinate_system":
        if (value.axis) {
          const directionMap = {
            "east": "e",
            "north": "n",
            "west": "w",
            "south": "s",
            "up": "u",
            "down": "d",
            "geocentricx": "e",
            "geocentricy": "n",
            "geocentricz": "u"
          };
          const mapped = value.axis.map((axis) => directionMap[axis.direction.toLowerCase()]);
          if (mapped.every(Boolean)) {
            result.axis = mapped.join("");
            if (result.axis.length === 2) {
              result.axis += "u";
            }
          }
          if (value.unit) {
            const { units, to_meter } = processUnit(value.unit);
            result.units = units;
            result.to_meter = to_meter;
          } else if (value.axis[0] && value.axis[0].unit) {
            const { units, to_meter } = processUnit(value.axis[0].unit);
            result.units = units;
            result.to_meter = to_meter;
          }
        }
        break;
      case "id":
        if (value.authority && value.code) {
          result.title = value.authority + ":" + value.code;
        }
        break;
      case "conversion":
        if (value.method && value.method.name) {
          result.projName = value.method.name;
        }
        if (value.parameters) {
          value.parameters.forEach((param) => {
            const paramName = param.name.toLowerCase().replace(/\s+/g, "_");
            const paramValue = param.value;
            if (param.unit && param.unit.conversion_factor) {
              result[paramName] = paramValue * param.unit.conversion_factor;
            } else if (param.unit === "degree") {
              result[paramName] = paramValue * Math.PI / 180;
            } else {
              result[paramName] = paramValue;
            }
          });
        }
        break;
      case "unit":
        if (value.name) {
          result.units = value.name.toLowerCase();
          if (result.units === "metre") {
            result.units = "meter";
          }
        }
        if (value.conversion_factor) {
          result.to_meter = value.conversion_factor;
        }
        break;
      case "base_crs":
        transformPROJJSON(value, result);
        result.datumCode = value.id ? value.id.authority + "_" + value.id.code : value.name;
        break;
    }
  });
  if (result.latitude_of_false_origin !== void 0) {
    result.lat0 = result.latitude_of_false_origin;
  }
  if (result.longitude_of_false_origin !== void 0) {
    result.long0 = result.longitude_of_false_origin;
  }
  if (result.latitude_of_standard_parallel !== void 0) {
    result.lat0 = result.latitude_of_standard_parallel;
    result.lat1 = result.latitude_of_standard_parallel;
  }
  if (result.latitude_of_1st_standard_parallel !== void 0) {
    result.lat1 = result.latitude_of_1st_standard_parallel;
  }
  if (result.latitude_of_2nd_standard_parallel !== void 0) {
    result.lat2 = result.latitude_of_2nd_standard_parallel;
  }
  if (result.latitude_of_projection_centre !== void 0) {
    result.lat0 = result.latitude_of_projection_centre;
  }
  if (result.longitude_of_projection_centre !== void 0) {
    result.longc = result.longitude_of_projection_centre;
  }
  if (result.easting_at_false_origin !== void 0) {
    result.x0 = result.easting_at_false_origin;
  }
  if (result.northing_at_false_origin !== void 0) {
    result.y0 = result.northing_at_false_origin;
  }
  if (result.latitude_of_natural_origin !== void 0) {
    result.lat0 = result.latitude_of_natural_origin;
  }
  if (result.longitude_of_natural_origin !== void 0) {
    result.long0 = result.longitude_of_natural_origin;
  }
  if (result.longitude_of_origin !== void 0) {
    result.long0 = result.longitude_of_origin;
  }
  if (result.false_easting !== void 0) {
    result.x0 = result.false_easting;
  }
  if (result.easting_at_projection_centre) {
    result.x0 = result.easting_at_projection_centre;
  }
  if (result.false_northing !== void 0) {
    result.y0 = result.false_northing;
  }
  if (result.northing_at_projection_centre) {
    result.y0 = result.northing_at_projection_centre;
  }
  if (result.standard_parallel_1 !== void 0) {
    result.lat1 = result.standard_parallel_1;
  }
  if (result.standard_parallel_2 !== void 0) {
    result.lat2 = result.standard_parallel_2;
  }
  if (result.scale_factor_at_natural_origin !== void 0) {
    result.k0 = result.scale_factor_at_natural_origin;
  }
  if (result.scale_factor_at_projection_centre !== void 0) {
    result.k0 = result.scale_factor_at_projection_centre;
  }
  if (result.scale_factor_on_pseudo_standard_parallel !== void 0) {
    result.k0 = result.scale_factor_on_pseudo_standard_parallel;
  }
  if (result.azimuth !== void 0) {
    result.alpha = result.azimuth;
  }
  if (result.azimuth_at_projection_centre !== void 0) {
    result.alpha = result.azimuth_at_projection_centre;
  }
  if (result.angle_from_rectified_to_skew_grid) {
    result.rectified_grid_angle = result.angle_from_rectified_to_skew_grid;
  }
  applyProjectionDefaults(result);
  return result;
}
var init_transformPROJJSON = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/transformPROJJSON.js"() {
    init_util();
  }
});

// ../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/index.js
function rename(obj, params2) {
  var outName = params2[0];
  var inName = params2[1];
  if (!(outName in obj) && inName in obj) {
    obj[outName] = obj[inName];
    if (params2.length === 3) {
      obj[outName] = params2[2](obj[outName]);
    }
  }
}
function cleanWKT(wkt) {
  var keys = Object.keys(wkt);
  for (var i = 0, ii = keys.length; i < ii; ++i) {
    var key = keys[i];
    if (knownTypes.indexOf(key) !== -1) {
      setPropertiesFromWkt(wkt[key]);
    }
    if (typeof wkt[key] === "object") {
      cleanWKT(wkt[key]);
    }
  }
}
function setPropertiesFromWkt(wkt) {
  if (wkt.AUTHORITY) {
    var authority = Object.keys(wkt.AUTHORITY)[0];
    if (authority && authority in wkt.AUTHORITY) {
      wkt.title = authority + ":" + wkt.AUTHORITY[authority];
    }
  }
  if (wkt.type === "GEOGCS") {
    wkt.projName = "longlat";
  } else if (wkt.type === "LOCAL_CS") {
    wkt.projName = "identity";
    wkt.local = true;
  } else {
    if (typeof wkt.PROJECTION === "object") {
      wkt.projName = Object.keys(wkt.PROJECTION)[0];
    } else {
      wkt.projName = wkt.PROJECTION;
    }
  }
  if (wkt.AXIS) {
    var axisOrder = "";
    for (var i = 0, ii = wkt.AXIS.length; i < ii; ++i) {
      var axis = [wkt.AXIS[i][0].toLowerCase(), wkt.AXIS[i][1].toLowerCase()];
      if (axis[0].indexOf("north") !== -1 || (axis[0] === "y" || axis[0] === "lat") && axis[1] === "north") {
        axisOrder += "n";
      } else if (axis[0].indexOf("south") !== -1 || (axis[0] === "y" || axis[0] === "lat") && axis[1] === "south") {
        axisOrder += "s";
      } else if (axis[0].indexOf("east") !== -1 || (axis[0] === "x" || axis[0] === "lon") && axis[1] === "east") {
        axisOrder += "e";
      } else if (axis[0].indexOf("west") !== -1 || (axis[0] === "x" || axis[0] === "lon") && axis[1] === "west") {
        axisOrder += "w";
      }
    }
    if (axisOrder.length === 2) {
      axisOrder += "u";
    }
    if (axisOrder.length === 3) {
      wkt.axis = axisOrder;
    }
  }
  if (wkt.UNIT) {
    wkt.units = wkt.UNIT.name.toLowerCase();
    if (wkt.units === "metre") {
      wkt.units = "meter";
    }
    if (wkt.UNIT.convert) {
      if (wkt.type === "GEOGCS") {
        if (wkt.DATUM && wkt.DATUM.SPHEROID) {
          wkt.to_meter = wkt.UNIT.convert * wkt.DATUM.SPHEROID.a;
        }
      } else {
        wkt.to_meter = wkt.UNIT.convert;
      }
    }
  }
  var geogcs = wkt.GEOGCS;
  if (wkt.type === "GEOGCS") {
    geogcs = wkt;
  }
  if (geogcs) {
    if (geogcs.PRIMEM && geogcs.PRIMEM.convert) {
      wkt.from_greenwich = d2r(geogcs.PRIMEM.convert);
    }
    if (geogcs.DATUM) {
      wkt.datumCode = geogcs.DATUM.name.toLowerCase();
    } else {
      wkt.datumCode = geogcs.name.toLowerCase();
    }
    if (wkt.datumCode.slice(0, 2) === "d_") {
      wkt.datumCode = wkt.datumCode.slice(2);
    }
    if (wkt.datumCode === "new_zealand_1949") {
      wkt.datumCode = "nzgd49";
    }
    if (wkt.datumCode === "wgs_1984" || wkt.datumCode === "world_geodetic_system_1984") {
      if (wkt.PROJECTION === "Mercator_Auxiliary_Sphere") {
        wkt.sphere = true;
      }
      wkt.datumCode = "wgs84";
    }
    if (wkt.datumCode === "belge_1972") {
      wkt.datumCode = "rnb72";
    }
    if (geogcs.DATUM && geogcs.DATUM.SPHEROID) {
      wkt.ellps = geogcs.DATUM.SPHEROID.name.replace("_19", "").replace(/[Cc]larke\_18/, "clrk");
      if (wkt.ellps.toLowerCase().slice(0, 13) === "international") {
        wkt.ellps = "intl";
      }
      wkt.a = geogcs.DATUM.SPHEROID.a;
      wkt.rf = parseFloat(geogcs.DATUM.SPHEROID.rf);
    }
    if (geogcs.DATUM && geogcs.DATUM.TOWGS84) {
      wkt.datum_params = geogcs.DATUM.TOWGS84;
    }
    if (~wkt.datumCode.indexOf("osgb_1936")) {
      wkt.datumCode = "osgb36";
    }
    if (~wkt.datumCode.indexOf("osni_1952")) {
      wkt.datumCode = "osni52";
    }
    if (~wkt.datumCode.indexOf("tm65") || ~wkt.datumCode.indexOf("geodetic_datum_of_1965")) {
      wkt.datumCode = "ire65";
    }
    if (wkt.datumCode === "ch1903+") {
      wkt.datumCode = "ch1903";
    }
    if (~wkt.datumCode.indexOf("israel")) {
      wkt.datumCode = "isr93";
    }
  }
  if (wkt.b && !isFinite(wkt.b)) {
    wkt.b = wkt.a;
  }
  if (wkt.rectified_grid_angle) {
    wkt.rectified_grid_angle = d2r(wkt.rectified_grid_angle);
  }
  function toMeter(input) {
    var ratio = wkt.to_meter || 1;
    return input * ratio;
  }
  var renamer = function(a) {
    return rename(wkt, a);
  };
  var list = [
    ["standard_parallel_1", "Standard_Parallel_1"],
    ["standard_parallel_1", "Latitude of 1st standard parallel"],
    ["standard_parallel_2", "Standard_Parallel_2"],
    ["standard_parallel_2", "Latitude of 2nd standard parallel"],
    ["false_easting", "False_Easting"],
    ["false_easting", "False easting"],
    ["false-easting", "Easting at false origin"],
    ["false_northing", "False_Northing"],
    ["false_northing", "False northing"],
    ["false_northing", "Northing at false origin"],
    ["central_meridian", "Central_Meridian"],
    ["central_meridian", "Longitude of natural origin"],
    ["central_meridian", "Longitude of false origin"],
    ["latitude_of_origin", "Latitude_Of_Origin"],
    ["latitude_of_origin", "Central_Parallel"],
    ["latitude_of_origin", "Latitude of natural origin"],
    ["latitude_of_origin", "Latitude of false origin"],
    ["scale_factor", "Scale_Factor"],
    ["k0", "scale_factor"],
    ["latitude_of_center", "Latitude_Of_Center"],
    ["latitude_of_center", "Latitude_of_center"],
    ["lat0", "latitude_of_center", d2r],
    ["longitude_of_center", "Longitude_Of_Center"],
    ["longitude_of_center", "Longitude_of_center"],
    ["longc", "longitude_of_center", d2r],
    ["x0", "false_easting", toMeter],
    ["y0", "false_northing", toMeter],
    ["long0", "central_meridian", d2r],
    ["lat0", "latitude_of_origin", d2r],
    ["lat0", "standard_parallel_1", d2r],
    ["lat1", "standard_parallel_1", d2r],
    ["lat2", "standard_parallel_2", d2r],
    ["azimuth", "Azimuth"],
    ["alpha", "azimuth", d2r],
    ["srsCode", "name"]
  ];
  list.forEach(renamer);
  applyProjectionDefaults(wkt);
}
function wkt_parser_default(wkt) {
  if (typeof wkt === "object") {
    return transformPROJJSON(wkt);
  }
  const version = detectWKTVersion(wkt);
  var lisp = parser_default(wkt);
  if (version === "WKT2") {
    const projjson = buildPROJJSON(lisp);
    return transformPROJJSON(projjson);
  }
  var type = lisp[0];
  var obj = {};
  sExpr(lisp, obj);
  cleanWKT(obj);
  return obj[type];
}
var knownTypes;
var init_wkt_parser = __esm({
  "../../node_modules/.pnpm/wkt-parser@1.5.5/node_modules/wkt-parser/index.js"() {
    init_buildPROJJSON();
    init_detectWKTVersion();
    init_parser();
    init_process();
    init_transformPROJJSON();
    init_util();
    knownTypes = [
      "PROJECTEDCRS",
      "PROJCRS",
      "GEOGCS",
      "GEOCCS",
      "PROJCS",
      "LOCAL_CS",
      "GEODCRS",
      "GEODETICCRS",
      "GEODETICDATUM",
      "ENGCRS",
      "ENGINEERINGCRS"
    ];
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/defs.js
function defs(name) {
  var that = this;
  if (arguments.length === 2) {
    var def = arguments[1];
    if (typeof def === "string") {
      if (def.charAt(0) === "+") {
        defs[
          /** @type {string} */
          name
        ] = projString_default(arguments[1]);
      } else {
        defs[
          /** @type {string} */
          name
        ] = wkt_parser_default(arguments[1]);
      }
    } else if (def && typeof def === "object" && !("projName" in def)) {
      defs[
        /** @type {string} */
        name
      ] = wkt_parser_default(arguments[1]);
    } else {
      defs[
        /** @type {string} */
        name
      ] = def;
      if (!def) {
        delete defs[
          /** @type {string} */
          name
        ];
      }
    }
  } else if (arguments.length === 1) {
    if (Array.isArray(name)) {
      return name.map(function(v) {
        if (Array.isArray(v)) {
          return defs.apply(that, v);
        } else {
          return defs(v);
        }
      });
    } else if (typeof name === "string") {
      if (name in defs) {
        return defs[name];
      }
    } else if ("EPSG" in name) {
      defs["EPSG:" + name.EPSG] = name;
    } else if ("ESRI" in name) {
      defs["ESRI:" + name.ESRI] = name;
    } else if ("IAU2000" in name) {
      defs["IAU2000:" + name.IAU2000] = name;
    } else {
      console.log(name);
    }
    return;
  }
}
var defs_default;
var init_defs = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/defs.js"() {
    init_global();
    init_projString();
    init_wkt_parser();
    global_default(defs);
    defs_default = defs;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/parseCode.js
function testObj(code) {
  return typeof code === "string";
}
function testDef(code) {
  return code in defs_default;
}
function testWKT(code) {
  return code.indexOf("+") !== 0 && code.indexOf("[") !== -1 || typeof code === "object" && !("srsCode" in code);
}
function checkMercator(item) {
  if (item.title) {
    return item.title.toLowerCase().indexOf("epsg:") === 0 && codes.indexOf(item.title.substr(5)) > -1;
  }
  var auth = match(item, "authority");
  if (!auth) {
    return;
  }
  var code = match(auth, "epsg");
  return code && codes.indexOf(code) > -1;
}
function checkProjStr(item) {
  var ext = match(item, "extension");
  if (!ext) {
    return;
  }
  return match(ext, "proj4");
}
function testProj(code) {
  return code[0] === "+";
}
function parse(code) {
  let out;
  if (testObj(code)) {
    if (testDef(code)) {
      out = defs_default[code];
    } else if (testWKT(code)) {
      out = wkt_parser_default(code);
      var maybeProjStr = checkProjStr(out);
      if (maybeProjStr) {
        out = projString_default(maybeProjStr);
      }
    } else if (testProj(code)) {
      out = projString_default(code);
    }
  } else if (!("projName" in code)) {
    out = wkt_parser_default(code);
  } else {
    out = code;
  }
  return out && checkMercator(out) ? defs_default["EPSG:3857"] : out;
}
var codes, parseCode_default;
var init_parseCode = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/parseCode.js"() {
    init_defs();
    init_wkt_parser();
    init_projString();
    init_match();
    codes = ["3857", "900913", "3785", "102113"];
    parseCode_default = parse;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/extend.js
function extend_default(destination, source) {
  destination = destination || {};
  var value, property;
  if (!source) {
    return destination;
  }
  for (property in source) {
    value = source[property];
    if (value !== void 0) {
      destination[property] = value;
    }
  }
  return destination;
}
var init_extend = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/extend.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/msfnz.js
function msfnz_default(eccent, sinphi, cosphi) {
  var con = eccent * sinphi;
  return cosphi / Math.sqrt(1 - con * con);
}
var init_msfnz = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/msfnz.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/sign.js
function sign_default(x) {
  return x < 0 ? -1 : 1;
}
var init_sign = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/sign.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/adjust_lon.js
function adjust_lon_default(x, skipAdjust) {
  if (skipAdjust) {
    return x;
  }
  return Math.abs(x) <= SPI ? x : x - sign_default(x) * TWO_PI;
}
var init_adjust_lon = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/adjust_lon.js"() {
    init_values();
    init_sign();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/tsfnz.js
function tsfnz_default(eccent, phi, sinphi) {
  var con = eccent * sinphi;
  var com = 0.5 * eccent;
  con = Math.pow((1 - con) / (1 + con), com);
  return Math.tan(0.5 * (HALF_PI - phi)) / con;
}
var init_tsfnz = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/tsfnz.js"() {
    init_values();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/phi2z.js
function phi2z_default(eccent, ts) {
  var eccnth = 0.5 * eccent;
  var con, dphi;
  var phi = HALF_PI - 2 * Math.atan(ts);
  for (var i = 0; i <= 15; i++) {
    con = eccent * Math.sin(phi);
    dphi = HALF_PI - 2 * Math.atan(ts * Math.pow((1 - con) / (1 + con), eccnth)) - phi;
    phi += dphi;
    if (Math.abs(dphi) <= 1e-10) {
      return phi;
    }
  }
  return -9999;
}
var init_phi2z = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/phi2z.js"() {
    init_values();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/merc.js
function init() {
  var con = this.b / this.a;
  this.es = 1 - con * con;
  if (!("x0" in this)) {
    this.x0 = 0;
  }
  if (!("y0" in this)) {
    this.y0 = 0;
  }
  this.e = Math.sqrt(this.es);
  if (this.lat_ts) {
    if (this.sphere) {
      this.k0 = Math.cos(this.lat_ts);
    } else {
      this.k0 = msfnz_default(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts));
    }
  } else {
    if (!this.k0) {
      if (this.k) {
        this.k0 = this.k;
      } else {
        this.k0 = 1;
      }
    }
  }
}
function forward(p) {
  var lon = p.x;
  var lat = p.y;
  if (lat * R2D > 90 && lat * R2D < -90 && lon * R2D > 180 && lon * R2D < -180) {
    return null;
  }
  var x, y;
  if (Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN) {
    return null;
  } else {
    if (this.sphere) {
      x = this.x0 + this.a * this.k0 * adjust_lon_default(lon - this.long0, this.over);
      y = this.y0 + this.a * this.k0 * Math.log(Math.tan(FORTPI + 0.5 * lat));
    } else {
      var sinphi = Math.sin(lat);
      var ts = tsfnz_default(this.e, lat, sinphi);
      x = this.x0 + this.a * this.k0 * adjust_lon_default(lon - this.long0, this.over);
      y = this.y0 - this.a * this.k0 * Math.log(ts);
    }
    p.x = x;
    p.y = y;
    return p;
  }
}
function inverse(p) {
  var x = p.x - this.x0;
  var y = p.y - this.y0;
  var lon, lat;
  if (this.sphere) {
    lat = HALF_PI - 2 * Math.atan(Math.exp(-y / (this.a * this.k0)));
  } else {
    var ts = Math.exp(-y / (this.a * this.k0));
    lat = phi2z_default(this.e, ts);
    if (lat === -9999) {
      return null;
    }
  }
  lon = adjust_lon_default(this.long0 + x / (this.a * this.k0), this.over);
  p.x = lon;
  p.y = lat;
  return p;
}
var names, merc_default;
var init_merc = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/merc.js"() {
    init_msfnz();
    init_adjust_lon();
    init_tsfnz();
    init_phi2z();
    init_values();
    names = ["Mercator", "Popular Visualisation Pseudo Mercator", "Mercator_1SP", "Mercator_Auxiliary_Sphere", "Mercator_Variant_A", "merc"];
    merc_default = {
      init,
      forward,
      inverse,
      names
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/longlat.js
function init2() {
}
function identity(pt) {
  return pt;
}
var names2, longlat_default;
var init_longlat = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/longlat.js"() {
    names2 = ["longlat", "identity"];
    longlat_default = {
      init: init2,
      forward: identity,
      inverse: identity,
      names: names2
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections.js
function add(proj, i) {
  var len = projStore.length;
  if (!proj.names) {
    console.log(i);
    return true;
  }
  projStore[len] = proj;
  proj.names.forEach(function(n) {
    names3[n.toLowerCase()] = len;
  });
  return this;
}
function getNormalizedProjName(n) {
  return n.replace(/[-\(\)\s]+/g, " ").trim().replace(/ /g, "_");
}
function get(name) {
  if (!name) {
    return false;
  }
  var n = name.toLowerCase();
  if (typeof names3[n] !== "undefined" && projStore[names3[n]]) {
    return projStore[names3[n]];
  }
  n = getNormalizedProjName(n);
  if (n in names3 && projStore[names3[n]]) {
    return projStore[names3[n]];
  }
}
function start() {
  projs.forEach(add);
}
var projs, names3, projStore, projections_default;
var init_projections = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections.js"() {
    init_merc();
    init_longlat();
    projs = [merc_default, longlat_default];
    names3 = {};
    projStore = [];
    projections_default = {
      start,
      add,
      get
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/Ellipsoid.js
var ellipsoids, Ellipsoid_default;
var init_Ellipsoid = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/Ellipsoid.js"() {
    ellipsoids = {
      MERIT: {
        a: 6378137,
        rf: 298.257,
        ellipseName: "MERIT 1983"
      },
      SGS85: {
        a: 6378136,
        rf: 298.257,
        ellipseName: "Soviet Geodetic System 85"
      },
      GRS80: {
        a: 6378137,
        rf: 298.257222101,
        ellipseName: "GRS 1980(IUGG, 1980)"
      },
      IAU76: {
        a: 6378140,
        rf: 298.257,
        ellipseName: "IAU 1976"
      },
      airy: {
        a: 6377563396e-3,
        b: 635625691e-2,
        ellipseName: "Airy 1830"
      },
      APL4: {
        a: 6378137,
        rf: 298.25,
        ellipseName: "Appl. Physics. 1965"
      },
      NWL9D: {
        a: 6378145,
        rf: 298.25,
        ellipseName: "Naval Weapons Lab., 1965"
      },
      mod_airy: {
        a: 6377340189e-3,
        b: 6356034446e-3,
        ellipseName: "Modified Airy"
      },
      andrae: {
        a: 637710443e-2,
        rf: 300,
        ellipseName: "Andrae 1876 (Den., Iclnd.)"
      },
      aust_SA: {
        a: 6378160,
        rf: 298.25,
        ellipseName: "Australian Natl & S. Amer. 1969"
      },
      GRS67: {
        a: 6378160,
        rf: 298.247167427,
        ellipseName: "GRS 67(IUGG 1967)"
      },
      bessel: {
        a: 6377397155e-3,
        rf: 299.1528128,
        ellipseName: "Bessel 1841"
      },
      bess_nam: {
        a: 6377483865e-3,
        rf: 299.1528128,
        ellipseName: "Bessel 1841 (Namibia)"
      },
      clrk66: {
        a: 63782064e-1,
        b: 63565838e-1,
        ellipseName: "Clarke 1866"
      },
      clrk80: {
        a: 6378249145e-3,
        rf: 293.4663,
        ellipseName: "Clarke 1880 mod."
      },
      clrk80ign: {
        a: 63782492e-1,
        b: 6356515,
        rf: 293.4660213,
        ellipseName: "Clarke 1880 (IGN)"
      },
      clrk58: {
        a: 6378293645208759e-9,
        rf: 294.2606763692654,
        ellipseName: "Clarke 1858"
      },
      CPM: {
        a: 63757387e-1,
        rf: 334.29,
        ellipseName: "Comm. des Poids et Mesures 1799"
      },
      delmbr: {
        a: 6376428,
        rf: 311.5,
        ellipseName: "Delambre 1810 (Belgium)"
      },
      engelis: {
        a: 637813605e-2,
        rf: 298.2566,
        ellipseName: "Engelis 1985"
      },
      evrst30: {
        a: 6377276345e-3,
        rf: 300.8017,
        ellipseName: "Everest 1830"
      },
      evrst48: {
        a: 6377304063e-3,
        rf: 300.8017,
        ellipseName: "Everest 1948"
      },
      evrst56: {
        a: 6377301243e-3,
        rf: 300.8017,
        ellipseName: "Everest 1956"
      },
      evrst69: {
        a: 6377295664e-3,
        rf: 300.8017,
        ellipseName: "Everest 1969"
      },
      evrstSS: {
        a: 6377298556e-3,
        rf: 300.8017,
        ellipseName: "Everest (Sabah & Sarawak)"
      },
      fschr60: {
        a: 6378166,
        rf: 298.3,
        ellipseName: "Fischer (Mercury Datum) 1960"
      },
      fschr60m: {
        a: 6378155,
        rf: 298.3,
        ellipseName: "Fischer 1960"
      },
      fschr68: {
        a: 6378150,
        rf: 298.3,
        ellipseName: "Fischer 1968"
      },
      helmert: {
        a: 6378200,
        rf: 298.3,
        ellipseName: "Helmert 1906"
      },
      hough: {
        a: 6378270,
        rf: 297,
        ellipseName: "Hough"
      },
      intl: {
        a: 6378388,
        rf: 297,
        ellipseName: "International 1909 (Hayford)"
      },
      kaula: {
        a: 6378163,
        rf: 298.24,
        ellipseName: "Kaula 1961"
      },
      lerch: {
        a: 6378139,
        rf: 298.257,
        ellipseName: "Lerch 1979"
      },
      mprts: {
        a: 6397300,
        rf: 191,
        ellipseName: "Maupertius 1738"
      },
      new_intl: {
        a: 63781575e-1,
        b: 63567722e-1,
        ellipseName: "New International 1967"
      },
      plessis: {
        a: 6376523,
        rf: 6355863,
        ellipseName: "Plessis 1817 (France)"
      },
      krass: {
        a: 6378245,
        rf: 298.3,
        ellipseName: "Krassovsky, 1942"
      },
      SEasia: {
        a: 6378155,
        b: 63567733205e-4,
        ellipseName: "Southeast Asia"
      },
      walbeck: {
        a: 6376896,
        b: 63558348467e-4,
        ellipseName: "Walbeck"
      },
      WGS60: {
        a: 6378165,
        rf: 298.3,
        ellipseName: "WGS 60"
      },
      WGS66: {
        a: 6378145,
        rf: 298.25,
        ellipseName: "WGS 66"
      },
      WGS7: {
        a: 6378135,
        rf: 298.26,
        ellipseName: "WGS 72"
      },
      WGS84: {
        a: 6378137,
        rf: 298.257223563,
        ellipseName: "WGS 84"
      },
      sphere: {
        a: 6370997,
        b: 6370997,
        ellipseName: "Normal Sphere (r=6370997)"
      }
    };
    Ellipsoid_default = ellipsoids;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/deriveConstants.js
function eccentricity(a, b, rf, R_A) {
  var a2 = a * a;
  var b2 = b * b;
  var es = (a2 - b2) / a2;
  var e = 0;
  if (R_A) {
    a *= 1 - es * (SIXTH + es * (RA4 + es * RA6));
    a2 = a * a;
    es = 0;
  } else {
    e = Math.sqrt(es);
  }
  var ep2 = (a2 - b2) / b2;
  return {
    es,
    e,
    ep2
  };
}
function sphere(a, b, rf, ellps, sphere2) {
  if (!a) {
    var ellipse = match(Ellipsoid_default, ellps);
    if (!ellipse) {
      ellipse = WGS84;
    }
    a = ellipse.a;
    b = ellipse.b;
    rf = ellipse.rf;
  }
  if (rf && !b) {
    b = (1 - 1 / rf) * a;
  }
  if (rf === 0 || Math.abs(a - b) < EPSLN) {
    sphere2 = true;
    b = a;
  }
  return {
    a,
    b,
    rf,
    sphere: sphere2
  };
}
var WGS84;
var init_deriveConstants = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/deriveConstants.js"() {
    init_values();
    init_Ellipsoid();
    init_match();
    WGS84 = Ellipsoid_default.WGS84;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/Datum.js
var datums, datum2, key, Datum_default;
var init_Datum = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/constants/Datum.js"() {
    datums = {
      wgs84: {
        towgs84: "0,0,0",
        ellipse: "WGS84",
        datumName: "WGS84"
      },
      ch1903: {
        towgs84: "674.374,15.056,405.346",
        ellipse: "bessel",
        datumName: "swiss"
      },
      ggrs87: {
        towgs84: "-199.87,74.79,246.62",
        ellipse: "GRS80",
        datumName: "Greek_Geodetic_Reference_System_1987"
      },
      nad83: {
        towgs84: "0,0,0",
        ellipse: "GRS80",
        datumName: "North_American_Datum_1983"
      },
      nad27: {
        nadgrids: "@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat",
        ellipse: "clrk66",
        datumName: "North_American_Datum_1927"
      },
      potsdam: {
        towgs84: "598.1,73.7,418.2,0.202,0.045,-2.455,6.7",
        ellipse: "bessel",
        datumName: "Potsdam Rauenberg 1950 DHDN"
      },
      carthage: {
        towgs84: "-263.0,6.0,431.0",
        ellipse: "clark80",
        datumName: "Carthage 1934 Tunisia"
      },
      hermannskogel: {
        towgs84: "577.326,90.129,463.919,5.137,1.474,5.297,2.4232",
        ellipse: "bessel",
        datumName: "Hermannskogel"
      },
      mgi: {
        towgs84: "577.326,90.129,463.919,5.137,1.474,5.297,2.4232",
        ellipse: "bessel",
        datumName: "Militar-Geographische Institut"
      },
      osni52: {
        towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
        ellipse: "airy",
        datumName: "Irish National"
      },
      ire65: {
        towgs84: "482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15",
        ellipse: "mod_airy",
        datumName: "Ireland 1965"
      },
      rassadiran: {
        towgs84: "-133.63,-157.5,-158.62",
        ellipse: "intl",
        datumName: "Rassadiran"
      },
      nzgd49: {
        towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993",
        ellipse: "intl",
        datumName: "New Zealand Geodetic Datum 1949"
      },
      osgb36: {
        towgs84: "446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894",
        ellipse: "airy",
        datumName: "Ordnance Survey of Great Britain 1936"
      },
      s_jtsk: {
        towgs84: "589,76,480",
        ellipse: "bessel",
        datumName: "S-JTSK (Ferro)"
      },
      beduaram: {
        towgs84: "-106,-87,188",
        ellipse: "clrk80",
        datumName: "Beduaram"
      },
      gunung_segara: {
        towgs84: "-403,684,41",
        ellipse: "bessel",
        datumName: "Gunung Segara Jakarta"
      },
      rnb72: {
        towgs84: "106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1",
        ellipse: "intl",
        datumName: "Reseau National Belge 1972"
      },
      EPSG_5451: {
        towgs84: "6.41,-49.05,-11.28,1.5657,0.5242,6.9718,-5.7649"
      },
      IGNF_LURESG: {
        towgs84: "-192.986,13.673,-39.309,-0.4099,-2.9332,2.6881,0.43"
      },
      EPSG_4614: {
        towgs84: "-119.4248,-303.65872,-11.00061,1.164298,0.174458,1.096259,3.657065"
      },
      EPSG_4615: {
        towgs84: "-494.088,-312.129,279.877,-1.423,-1.013,1.59,-0.748"
      },
      ESRI_37241: {
        towgs84: "-76.822,257.457,-12.817,2.136,-0.033,-2.392,-0.031"
      },
      ESRI_37249: {
        towgs84: "-440.296,58.548,296.265,1.128,10.202,4.559,-0.438"
      },
      ESRI_37245: {
        towgs84: "-511.151,-181.269,139.609,1.05,2.703,1.798,3.071"
      },
      EPSG_4178: {
        towgs84: "24.9,-126.4,-93.2,-0.063,-0.247,-0.041,1.01"
      },
      EPSG_4622: {
        towgs84: "-472.29,-5.63,-304.12,0.4362,-0.8374,0.2563,1.8984"
      },
      EPSG_4625: {
        towgs84: "126.93,547.94,130.41,-2.7867,5.1612,-0.8584,13.8227"
      },
      EPSG_5252: {
        towgs84: "0.023,0.036,-0.068,0.00176,0.00912,-0.01136,0.00439"
      },
      EPSG_4314: {
        towgs84: "597.1,71.4,412.1,0.894,0.068,-1.563,7.58"
      },
      EPSG_4282: {
        towgs84: "-178.3,-316.7,-131.5,5.278,6.077,10.979,19.166"
      },
      EPSG_4231: {
        towgs84: "-83.11,-97.38,-117.22,0.005693,-0.044698,0.044285,0.1218"
      },
      EPSG_4274: {
        towgs84: "-230.994,102.591,25.199,0.633,-0.239,0.9,1.95"
      },
      EPSG_4134: {
        towgs84: "-180.624,-225.516,173.919,-0.81,-1.898,8.336,16.71006"
      },
      EPSG_4254: {
        towgs84: "18.38,192.45,96.82,0.056,-0.142,-0.2,-0.0013"
      },
      EPSG_4159: {
        towgs84: "-194.513,-63.978,-25.759,-3.4027,3.756,-3.352,-0.9175"
      },
      EPSG_4687: {
        towgs84: "0.072,-0.507,-0.245,0.0183,-0.0003,0.007,-0.0093"
      },
      EPSG_4227: {
        towgs84: "-83.58,-397.54,458.78,-17.595,-2.847,4.256,3.225"
      },
      EPSG_4746: {
        towgs84: "599.4,72.4,419.2,-0.062,-0.022,-2.723,6.46"
      },
      EPSG_4745: {
        towgs84: "612.4,77,440.2,-0.054,0.057,-2.797,2.55"
      },
      EPSG_6311: {
        towgs84: "8.846,-4.394,-1.122,-0.00237,-0.146528,0.130428,0.783926"
      },
      EPSG_4289: {
        towgs84: "565.7381,50.4018,465.2904,-0.395026,0.330772,-1.876073,4.07244"
      },
      EPSG_4230: {
        towgs84: "-68.863,-134.888,-111.49,-0.53,-0.14,0.57,-3.4"
      },
      EPSG_4154: {
        towgs84: "-123.02,-158.95,-168.47"
      },
      EPSG_4156: {
        towgs84: "570.8,85.7,462.8,4.998,1.587,5.261,3.56"
      },
      EPSG_4299: {
        towgs84: "482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15"
      },
      EPSG_4179: {
        towgs84: "33.4,-146.6,-76.3,-0.359,-0.053,0.844,-0.84"
      },
      EPSG_4313: {
        towgs84: "-106.8686,52.2978,-103.7239,0.3366,-0.457,1.8422,-1.2747"
      },
      EPSG_4194: {
        towgs84: "163.511,127.533,-159.789"
      },
      EPSG_4195: {
        towgs84: "105,326,-102.5"
      },
      EPSG_4196: {
        towgs84: "-45,417,-3.5"
      },
      EPSG_4611: {
        towgs84: "-162.619,-276.959,-161.764,0.067753,-2.243648,-1.158828,-1.094246"
      },
      EPSG_4633: {
        towgs84: "137.092,131.66,91.475,-1.9436,-11.5993,-4.3321,-7.4824"
      },
      EPSG_4641: {
        towgs84: "-408.809,366.856,-412.987,1.8842,-0.5308,2.1655,-121.0993"
      },
      EPSG_4643: {
        towgs84: "-480.26,-438.32,-643.429,16.3119,20.1721,-4.0349,-111.7002"
      },
      EPSG_4300: {
        towgs84: "482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15"
      },
      EPSG_4188: {
        towgs84: "482.5,-130.6,564.6,-1.042,-0.214,-0.631,8.15"
      },
      EPSG_4660: {
        towgs84: "982.6087,552.753,-540.873,6.681627,-31.611492,-19.848161,16.805"
      },
      EPSG_4662: {
        towgs84: "97.295,-263.247,310.882,-1.5999,0.8386,3.1409,13.3259"
      },
      EPSG_3906: {
        towgs84: "577.88891,165.22205,391.18289,4.9145,-0.94729,-13.05098,7.78664"
      },
      EPSG_4307: {
        towgs84: "-209.3622,-87.8162,404.6198,0.0046,3.4784,0.5805,-1.4547"
      },
      EPSG_6892: {
        towgs84: "-76.269,-16.683,68.562,-6.275,10.536,-4.286,-13.686"
      },
      EPSG_4690: {
        towgs84: "221.597,152.441,176.523,2.403,1.3893,0.884,11.4648"
      },
      EPSG_4691: {
        towgs84: "218.769,150.75,176.75,3.5231,2.0037,1.288,10.9817"
      },
      EPSG_4629: {
        towgs84: "72.51,345.411,79.241,-1.5862,-0.8826,-0.5495,1.3653"
      },
      EPSG_4630: {
        towgs84: "165.804,216.213,180.26,-0.6251,-0.4515,-0.0721,7.4111"
      },
      EPSG_4692: {
        towgs84: "217.109,86.452,23.711,0.0183,-0.0003,0.007,-0.0093"
      },
      EPSG_9333: {
        towgs84: "0,0,0,-0.008393,0.000749,-0.010276,0"
      },
      EPSG_9059: {
        towgs84: "0,0,0"
      },
      EPSG_4312: {
        towgs84: "601.705,84.263,485.227,4.7354,1.3145,5.393,-2.3887"
      },
      EPSG_4123: {
        towgs84: "-96.062,-82.428,-121.753,4.801,0.345,-1.376,1.496"
      },
      EPSG_4309: {
        towgs84: "-124.45,183.74,44.64,-0.4384,0.5446,-0.9706,-2.1365"
      },
      ESRI_104106: {
        towgs84: "-283.088,-70.693,117.445,-1.157,0.059,-0.652,-4.058"
      },
      EPSG_4281: {
        towgs84: "-219.247,-73.802,269.529"
      },
      EPSG_4322: {
        towgs84: "0,0,4.5"
      },
      EPSG_4324: {
        towgs84: "0,0,1.9"
      },
      EPSG_4284: {
        towgs84: "43.822,-108.842,-119.585,1.455,-0.761,0.737,0.549"
      },
      EPSG_4277: {
        towgs84: "446.448,-125.157,542.06,0.15,0.247,0.842,-20.489"
      },
      EPSG_4207: {
        towgs84: "-282.1,-72.2,120,-1.529,0.145,-0.89,-4.46"
      },
      EPSG_4688: {
        towgs84: "347.175,1077.618,2623.677,33.9058,-70.6776,9.4013,186.0647"
      },
      EPSG_4689: {
        towgs84: "410.793,54.542,80.501,-2.5596,-2.3517,-0.6594,17.3218"
      },
      EPSG_4720: {
        towgs84: "0,0,4.5"
      },
      EPSG_4273: {
        towgs84: "278.3,93,474.5,7.889,0.05,-6.61,6.21"
      },
      EPSG_4240: {
        towgs84: "204.64,834.74,293.8"
      },
      EPSG_4817: {
        towgs84: "278.3,93,474.5,7.889,0.05,-6.61,6.21"
      },
      ESRI_104131: {
        towgs84: "426.62,142.62,460.09,4.98,4.49,-12.42,-17.1"
      },
      EPSG_4265: {
        towgs84: "-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68"
      },
      EPSG_4263: {
        towgs84: "-111.92,-87.85,114.5,1.875,0.202,0.219,0.032"
      },
      EPSG_4298: {
        towgs84: "-689.5937,623.84046,-65.93566,-0.02331,1.17094,-0.80054,5.88536"
      },
      EPSG_4270: {
        towgs84: "-253.4392,-148.452,386.5267,0.15605,0.43,-0.1013,-0.0424"
      },
      EPSG_4229: {
        towgs84: "-121.8,98.1,-10.7"
      },
      EPSG_4220: {
        towgs84: "-55.5,-348,-229.2"
      },
      EPSG_4214: {
        towgs84: "12.646,-155.176,-80.863"
      },
      EPSG_4232: {
        towgs84: "-345,3,223"
      },
      EPSG_4238: {
        towgs84: "-1.977,-13.06,-9.993,0.364,0.254,0.689,-1.037"
      },
      EPSG_4168: {
        towgs84: "-170,33,326"
      },
      EPSG_4131: {
        towgs84: "199,931,318.9"
      },
      EPSG_4152: {
        towgs84: "-0.9102,2.0141,0.5602,0.029039,0.010065,0.010101,0"
      },
      EPSG_5228: {
        towgs84: "572.213,85.334,461.94,4.9732,1.529,5.2484,3.5378"
      },
      EPSG_8351: {
        towgs84: "485.021,169.465,483.839,7.786342,4.397554,4.102655,0"
      },
      EPSG_4683: {
        towgs84: "-127.62,-67.24,-47.04,-3.068,4.903,1.578,-1.06"
      },
      EPSG_4133: {
        towgs84: "0,0,0"
      },
      EPSG_7373: {
        towgs84: "0.819,-0.5762,-1.6446,-0.00378,-0.03317,0.00318,0.0693"
      },
      EPSG_9075: {
        towgs84: "-0.9102,2.0141,0.5602,0.029039,0.010065,0.010101,0"
      },
      EPSG_9072: {
        towgs84: "-0.9102,2.0141,0.5602,0.029039,0.010065,0.010101,0"
      },
      EPSG_9294: {
        towgs84: "1.16835,-1.42001,-2.24431,-0.00822,-0.05508,0.01818,0.23388"
      },
      EPSG_4212: {
        towgs84: "-267.434,173.496,181.814,-13.4704,8.7154,7.3926,14.7492"
      },
      EPSG_4191: {
        towgs84: "-44.183,-0.58,-38.489,2.3867,2.7072,-3.5196,-8.2703"
      },
      EPSG_4237: {
        towgs84: "52.684,-71.194,-13.975,-0.312,-0.1063,-0.3729,1.0191"
      },
      EPSG_4740: {
        towgs84: "-1.08,-0.27,-0.9"
      },
      EPSG_4124: {
        towgs84: "419.3836,99.3335,591.3451,0.850389,1.817277,-7.862238,-0.99496"
      },
      EPSG_5681: {
        towgs84: "584.9636,107.7175,413.8067,1.1155,0.2824,-3.1384,7.9922"
      },
      EPSG_4141: {
        towgs84: "23.772,17.49,17.859,-0.3132,-1.85274,1.67299,-5.4262"
      },
      EPSG_4204: {
        towgs84: "-85.645,-273.077,-79.708,2.289,-1.421,2.532,3.194"
      },
      EPSG_4319: {
        towgs84: "226.702,-193.337,-35.371,-2.229,-4.391,9.238,0.9798"
      },
      EPSG_4200: {
        towgs84: "24.82,-131.21,-82.66"
      },
      EPSG_4130: {
        towgs84: "0,0,0"
      },
      EPSG_4127: {
        towgs84: "-82.875,-57.097,-156.768,-2.158,1.524,-0.982,-0.359"
      },
      EPSG_4149: {
        towgs84: "674.374,15.056,405.346"
      },
      EPSG_4617: {
        towgs84: "-0.991,1.9072,0.5129,0.02579,0.00965,0.01166,0"
      },
      EPSG_4663: {
        towgs84: "-210.502,-66.902,-48.476,2.094,-15.067,-5.817,0.485"
      },
      EPSG_4664: {
        towgs84: "-211.939,137.626,58.3,-0.089,0.251,0.079,0.384"
      },
      EPSG_4665: {
        towgs84: "-105.854,165.589,-38.312,-0.003,-0.026,0.024,-0.048"
      },
      EPSG_4666: {
        towgs84: "631.392,-66.551,481.442,1.09,-4.445,-4.487,-4.43"
      },
      EPSG_4756: {
        towgs84: "-192.873,-39.382,-111.202,-0.00205,-0.0005,0.00335,0.0188"
      },
      EPSG_4723: {
        towgs84: "-179.483,-69.379,-27.584,-7.862,8.163,6.042,-13.925"
      },
      EPSG_4726: {
        towgs84: "8.853,-52.644,180.304,-0.393,-2.323,2.96,-24.081"
      },
      EPSG_4267: {
        towgs84: "-8.0,160.0,176.0"
      },
      EPSG_5365: {
        towgs84: "-0.16959,0.35312,0.51846,0.03385,-0.16325,0.03446,0.03693"
      },
      EPSG_4218: {
        towgs84: "304.5,306.5,-318.1"
      },
      EPSG_4242: {
        towgs84: "-33.722,153.789,94.959,-8.581,-4.478,4.54,8.95"
      },
      EPSG_4216: {
        towgs84: "-292.295,248.758,429.447,4.9971,2.99,6.6906,1.0289"
      },
      ESRI_104105: {
        towgs84: "631.392,-66.551,481.442,1.09,-4.445,-4.487,-4.43"
      },
      ESRI_104129: {
        towgs84: "0,0,0"
      },
      EPSG_4673: {
        towgs84: "174.05,-25.49,112.57"
      },
      EPSG_4202: {
        towgs84: "-124,-60,154"
      },
      EPSG_4203: {
        towgs84: "-117.763,-51.51,139.061,0.292,0.443,0.277,-0.191"
      },
      EPSG_3819: {
        towgs84: "595.48,121.69,515.35,4.115,-2.9383,0.853,-3.408"
      },
      EPSG_8694: {
        towgs84: "-93.799,-132.737,-219.073,-1.844,0.648,-6.37,-0.169"
      },
      EPSG_4145: {
        towgs84: "275.57,676.78,229.6"
      },
      EPSG_4283: {
        towgs84: "0.06155,-0.01087,-0.04019,0.039492,0.032722,0.032898,-0.009994"
      },
      EPSG_4317: {
        towgs84: "2.3287,-147.0425,-92.0802,-0.309248,0.324822,0.497299,5.689063"
      },
      EPSG_4272: {
        towgs84: "59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993"
      },
      EPSG_4248: {
        towgs84: "-307.7,265.3,-363.5"
      },
      EPSG_5561: {
        towgs84: "24,-121,-76"
      },
      EPSG_5233: {
        towgs84: "-0.293,766.95,87.713,0.195704,1.695068,3.473016,-0.039338"
      },
      ESRI_104130: {
        towgs84: "-86,-98,-119"
      },
      ESRI_104102: {
        towgs84: "682,-203,480"
      },
      ESRI_37207: {
        towgs84: "7,-10,-26"
      },
      EPSG_4675: {
        towgs84: "59.935,118.4,-10.871"
      },
      ESRI_104109: {
        towgs84: "-89.121,-348.182,260.871"
      },
      ESRI_104112: {
        towgs84: "-185.583,-230.096,281.361"
      },
      ESRI_104113: {
        towgs84: "25.1,-275.6,222.6"
      },
      IGNF_WGS72G: {
        towgs84: "0,12,6"
      },
      IGNF_NTFG: {
        towgs84: "-168,-60,320"
      },
      IGNF_EFATE57G: {
        towgs84: "-127,-769,472"
      },
      IGNF_PGP50G: {
        towgs84: "324.8,153.6,172.1"
      },
      IGNF_REUN47G: {
        towgs84: "94,-948,-1262"
      },
      IGNF_CSG67G: {
        towgs84: "-186,230,110"
      },
      IGNF_GUAD48G: {
        towgs84: "-467,-16,-300"
      },
      IGNF_TAHI51G: {
        towgs84: "162,117,154"
      },
      IGNF_TAHAAG: {
        towgs84: "65,342,77"
      },
      IGNF_NUKU72G: {
        towgs84: "84,274,65"
      },
      IGNF_PETRELS72G: {
        towgs84: "365,194,166"
      },
      IGNF_WALL78G: {
        towgs84: "253,-133,-127"
      },
      IGNF_MAYO50G: {
        towgs84: "-382,-59,-262"
      },
      IGNF_TANNAG: {
        towgs84: "-139,-967,436"
      },
      IGNF_IGN72G: {
        towgs84: "-13,-348,292"
      },
      IGNF_ATIGG: {
        towgs84: "1118,23,66"
      },
      IGNF_FANGA84G: {
        towgs84: "150.57,158.33,118.32"
      },
      IGNF_RUSAT84G: {
        towgs84: "202.13,174.6,-15.74"
      },
      IGNF_KAUE70G: {
        towgs84: "126.74,300.1,-75.49"
      },
      IGNF_MOP90G: {
        towgs84: "-10.8,-1.8,12.77"
      },
      IGNF_MHPF67G: {
        towgs84: "338.08,212.58,-296.17"
      },
      IGNF_TAHI79G: {
        towgs84: "160.61,116.05,153.69"
      },
      IGNF_ANAA92G: {
        towgs84: "1.5,3.84,4.81"
      },
      IGNF_MARQUI72G: {
        towgs84: "330.91,-13.92,58.56"
      },
      IGNF_APAT86G: {
        towgs84: "143.6,197.82,74.05"
      },
      IGNF_TUBU69G: {
        towgs84: "237.17,171.61,-77.84"
      },
      IGNF_STPM50G: {
        towgs84: "11.363,424.148,373.13"
      },
      EPSG_4150: {
        towgs84: "674.374,15.056,405.346"
      },
      EPSG_4754: {
        towgs84: "-208.4058,-109.8777,-2.5764"
      },
      ESRI_104101: {
        towgs84: "372.87,149.23,585.29"
      },
      EPSG_4693: {
        towgs84: "0,-0.15,0.68"
      },
      EPSG_6207: {
        towgs84: "293.17,726.18,245.36"
      },
      EPSG_4153: {
        towgs84: "-133.63,-157.5,-158.62"
      },
      EPSG_4132: {
        towgs84: "-241.54,-163.64,396.06"
      },
      EPSG_4221: {
        towgs84: "-154.5,150.7,100.4"
      },
      EPSG_4266: {
        towgs84: "-80.7,-132.5,41.1"
      },
      EPSG_4193: {
        towgs84: "-70.9,-151.8,-41.4"
      },
      EPSG_5340: {
        towgs84: "-0.41,0.46,-0.35"
      },
      EPSG_4246: {
        towgs84: "-294.7,-200.1,525.5"
      },
      EPSG_4318: {
        towgs84: "-3.2,-5.7,2.8"
      },
      EPSG_4121: {
        towgs84: "-199.87,74.79,246.62"
      },
      EPSG_4223: {
        towgs84: "-260.1,5.5,432.2"
      },
      EPSG_4158: {
        towgs84: "-0.465,372.095,171.736"
      },
      EPSG_4285: {
        towgs84: "-128.16,-282.42,21.93"
      },
      EPSG_4613: {
        towgs84: "-404.78,685.68,45.47"
      },
      EPSG_4607: {
        towgs84: "195.671,332.517,274.607"
      },
      EPSG_4475: {
        towgs84: "-381.788,-57.501,-256.673"
      },
      EPSG_4208: {
        towgs84: "-157.84,308.54,-146.6"
      },
      EPSG_4743: {
        towgs84: "70.995,-335.916,262.898"
      },
      EPSG_4710: {
        towgs84: "-323.65,551.39,-491.22"
      },
      EPSG_7881: {
        towgs84: "-0.077,0.079,0.086"
      },
      EPSG_4682: {
        towgs84: "283.729,735.942,261.143"
      },
      EPSG_4739: {
        towgs84: "-156,-271,-189"
      },
      EPSG_4679: {
        towgs84: "-80.01,253.26,291.19"
      },
      EPSG_4750: {
        towgs84: "-56.263,16.136,-22.856"
      },
      EPSG_4644: {
        towgs84: "-10.18,-350.43,291.37"
      },
      EPSG_4695: {
        towgs84: "-103.746,-9.614,-255.95"
      },
      EPSG_4292: {
        towgs84: "-355,21,72"
      },
      EPSG_4302: {
        towgs84: "-61.702,284.488,472.052"
      },
      EPSG_4143: {
        towgs84: "-124.76,53,466.79"
      },
      EPSG_4606: {
        towgs84: "-153,153,307"
      },
      EPSG_4699: {
        towgs84: "-770.1,158.4,-498.2"
      },
      EPSG_4247: {
        towgs84: "-273.5,110.6,-357.9"
      },
      EPSG_4160: {
        towgs84: "8.88,184.86,106.69"
      },
      EPSG_4161: {
        towgs84: "-233.43,6.65,173.64"
      },
      EPSG_9251: {
        towgs84: "-9.5,122.9,138.2"
      },
      EPSG_9253: {
        towgs84: "-78.1,101.6,133.3"
      },
      EPSG_4297: {
        towgs84: "-198.383,-240.517,-107.909"
      },
      EPSG_4269: {
        towgs84: "0,0,0"
      },
      EPSG_4301: {
        towgs84: "-147,506,687"
      },
      EPSG_4618: {
        towgs84: "-59,-11,-52"
      },
      EPSG_4612: {
        towgs84: "0,0,0"
      },
      EPSG_4678: {
        towgs84: "44.585,-131.212,-39.544"
      },
      EPSG_4250: {
        towgs84: "-130,29,364"
      },
      EPSG_4144: {
        towgs84: "214,804,268"
      },
      EPSG_4147: {
        towgs84: "-17.51,-108.32,-62.39"
      },
      EPSG_4259: {
        towgs84: "-254.1,-5.36,-100.29"
      },
      EPSG_4164: {
        towgs84: "-76,-138,67"
      },
      EPSG_4211: {
        towgs84: "-378.873,676.002,-46.255"
      },
      EPSG_4182: {
        towgs84: "-422.651,-172.995,84.02"
      },
      EPSG_4224: {
        towgs84: "-143.87,243.37,-33.52"
      },
      EPSG_4225: {
        towgs84: "-205.57,168.77,-4.12"
      },
      EPSG_5527: {
        towgs84: "-67.35,3.88,-38.22"
      },
      EPSG_4752: {
        towgs84: "98,390,-22"
      },
      EPSG_4310: {
        towgs84: "-30,190,89"
      },
      EPSG_9248: {
        towgs84: "-192.26,65.72,132.08"
      },
      EPSG_4680: {
        towgs84: "124.5,-63.5,-281"
      },
      EPSG_4701: {
        towgs84: "-79.9,-158,-168.9"
      },
      EPSG_4706: {
        towgs84: "-146.21,112.63,4.05"
      },
      EPSG_4805: {
        towgs84: "682,-203,480"
      },
      EPSG_4201: {
        towgs84: "-165,-11,206"
      },
      EPSG_4210: {
        towgs84: "-157,-2,-299"
      },
      EPSG_4183: {
        towgs84: "-104,167,-38"
      },
      EPSG_4139: {
        towgs84: "11,72,-101"
      },
      EPSG_4668: {
        towgs84: "-86,-98,-119"
      },
      EPSG_4717: {
        towgs84: "-2,151,181"
      },
      EPSG_4732: {
        towgs84: "102,52,-38"
      },
      EPSG_4280: {
        towgs84: "-377,681,-50"
      },
      EPSG_4209: {
        towgs84: "-138,-105,-289"
      },
      EPSG_4261: {
        towgs84: "31,146,47"
      },
      EPSG_4658: {
        towgs84: "-73,46,-86"
      },
      EPSG_4721: {
        towgs84: "265.025,384.929,-194.046"
      },
      EPSG_4222: {
        towgs84: "-136,-108,-292"
      },
      EPSG_4601: {
        towgs84: "-255,-15,71"
      },
      EPSG_4602: {
        towgs84: "725,685,536"
      },
      EPSG_4603: {
        towgs84: "72,213.7,93"
      },
      EPSG_4605: {
        towgs84: "9,183,236"
      },
      EPSG_4621: {
        towgs84: "137,248,-430"
      },
      EPSG_4657: {
        towgs84: "-28,199,5"
      },
      EPSG_4316: {
        towgs84: "103.25,-100.4,-307.19"
      },
      EPSG_4642: {
        towgs84: "-13,-348,292"
      },
      EPSG_4698: {
        towgs84: "145,-187,103"
      },
      EPSG_4192: {
        towgs84: "-206.1,-174.7,-87.7"
      },
      EPSG_4311: {
        towgs84: "-265,120,-358"
      },
      EPSG_4135: {
        towgs84: "58,-283,-182"
      },
      ESRI_104138: {
        towgs84: "198,-226,-347"
      },
      EPSG_4245: {
        towgs84: "-11,851,5"
      },
      EPSG_4142: {
        towgs84: "-125,53,467"
      },
      EPSG_4213: {
        towgs84: "-106,-87,188"
      },
      EPSG_4253: {
        towgs84: "-133,-77,-51"
      },
      EPSG_4129: {
        towgs84: "-132,-110,-335"
      },
      EPSG_4713: {
        towgs84: "-77,-128,142"
      },
      EPSG_4239: {
        towgs84: "217,823,299"
      },
      EPSG_4146: {
        towgs84: "295,736,257"
      },
      EPSG_4155: {
        towgs84: "-83,37,124"
      },
      EPSG_4165: {
        towgs84: "-173,253,27"
      },
      EPSG_4672: {
        towgs84: "175,-38,113"
      },
      EPSG_4236: {
        towgs84: "-637,-549,-203"
      },
      EPSG_4251: {
        towgs84: "-90,40,88"
      },
      EPSG_4271: {
        towgs84: "-2,374,172"
      },
      EPSG_4175: {
        towgs84: "-88,4,101"
      },
      EPSG_4716: {
        towgs84: "298,-304,-375"
      },
      EPSG_4315: {
        towgs84: "-23,259,-9"
      },
      EPSG_4744: {
        towgs84: "-242.2,-144.9,370.3"
      },
      EPSG_4244: {
        towgs84: "-97,787,86"
      },
      EPSG_4293: {
        towgs84: "616,97,-251"
      },
      EPSG_4714: {
        towgs84: "-127,-769,472"
      },
      EPSG_4736: {
        towgs84: "260,12,-147"
      },
      EPSG_6883: {
        towgs84: "-235,-110,393"
      },
      EPSG_6894: {
        towgs84: "-63,176,185"
      },
      EPSG_4205: {
        towgs84: "-43,-163,45"
      },
      EPSG_4256: {
        towgs84: "41,-220,-134"
      },
      EPSG_4262: {
        towgs84: "639,405,60"
      },
      EPSG_4604: {
        towgs84: "174,359,365"
      },
      EPSG_4169: {
        towgs84: "-115,118,426"
      },
      EPSG_4620: {
        towgs84: "-106,-129,165"
      },
      EPSG_4184: {
        towgs84: "-203,141,53"
      },
      EPSG_4616: {
        towgs84: "-289,-124,60"
      },
      EPSG_9403: {
        towgs84: "-307,-92,127"
      },
      EPSG_4684: {
        towgs84: "-133,-321,50"
      },
      EPSG_4708: {
        towgs84: "-491,-22,435"
      },
      EPSG_4707: {
        towgs84: "114,-116,-333"
      },
      EPSG_4709: {
        towgs84: "145,75,-272"
      },
      EPSG_4712: {
        towgs84: "-205,107,53"
      },
      EPSG_4711: {
        towgs84: "124,-234,-25"
      },
      EPSG_4718: {
        towgs84: "230,-199,-752"
      },
      EPSG_4719: {
        towgs84: "211,147,111"
      },
      EPSG_4724: {
        towgs84: "208,-435,-229"
      },
      EPSG_4725: {
        towgs84: "189,-79,-202"
      },
      EPSG_4735: {
        towgs84: "647,1777,-1124"
      },
      EPSG_4722: {
        towgs84: "-794,119,-298"
      },
      EPSG_4728: {
        towgs84: "-307,-92,127"
      },
      EPSG_4734: {
        towgs84: "-632,438,-609"
      },
      EPSG_4727: {
        towgs84: "912,-58,1227"
      },
      EPSG_4729: {
        towgs84: "185,165,42"
      },
      EPSG_4730: {
        towgs84: "170,42,84"
      },
      EPSG_4733: {
        towgs84: "276,-57,149"
      },
      ESRI_37218: {
        towgs84: "230,-199,-752"
      },
      ESRI_37240: {
        towgs84: "-7,215,225"
      },
      ESRI_37221: {
        towgs84: "252,-209,-751"
      },
      ESRI_4305: {
        towgs84: "-123,-206,219"
      },
      ESRI_104139: {
        towgs84: "-73,-247,227"
      },
      EPSG_4748: {
        towgs84: "51,391,-36"
      },
      EPSG_4219: {
        towgs84: "-384,664,-48"
      },
      EPSG_4255: {
        towgs84: "-333,-222,114"
      },
      EPSG_4257: {
        towgs84: "-587.8,519.75,145.76"
      },
      EPSG_4646: {
        towgs84: "-963,510,-359"
      },
      EPSG_6881: {
        towgs84: "-24,-203,268"
      },
      EPSG_6882: {
        towgs84: "-183,-15,273"
      },
      EPSG_4715: {
        towgs84: "-104,-129,239"
      },
      IGNF_RGF93GDD: {
        towgs84: "0,0,0"
      },
      IGNF_RGM04GDD: {
        towgs84: "0,0,0"
      },
      IGNF_RGSPM06GDD: {
        towgs84: "0,0,0"
      },
      IGNF_RGTAAF07GDD: {
        towgs84: "0,0,0"
      },
      IGNF_RGFG95GDD: {
        towgs84: "0,0,0"
      },
      IGNF_RGNCG: {
        towgs84: "0,0,0"
      },
      IGNF_RGPFGDD: {
        towgs84: "0,0,0"
      },
      IGNF_ETRS89G: {
        towgs84: "0,0,0"
      },
      IGNF_RGR92GDD: {
        towgs84: "0,0,0"
      },
      EPSG_4173: {
        towgs84: "0,0,0"
      },
      EPSG_4180: {
        towgs84: "0,0,0"
      },
      EPSG_4619: {
        towgs84: "0,0,0"
      },
      EPSG_4667: {
        towgs84: "0,0,0"
      },
      EPSG_4075: {
        towgs84: "0,0,0"
      },
      EPSG_6706: {
        towgs84: "0,0,0"
      },
      EPSG_7798: {
        towgs84: "0,0,0"
      },
      EPSG_4661: {
        towgs84: "0,0,0"
      },
      EPSG_4669: {
        towgs84: "0,0,0"
      },
      EPSG_8685: {
        towgs84: "0,0,0"
      },
      EPSG_4151: {
        towgs84: "0,0,0"
      },
      EPSG_9702: {
        towgs84: "0,0,0"
      },
      EPSG_4758: {
        towgs84: "0,0,0"
      },
      EPSG_4761: {
        towgs84: "0,0,0"
      },
      EPSG_4765: {
        towgs84: "0,0,0"
      },
      EPSG_8997: {
        towgs84: "0,0,0"
      },
      EPSG_4023: {
        towgs84: "0,0,0"
      },
      EPSG_4670: {
        towgs84: "0,0,0"
      },
      EPSG_4694: {
        towgs84: "0,0,0"
      },
      EPSG_4148: {
        towgs84: "0,0,0"
      },
      EPSG_4163: {
        towgs84: "0,0,0"
      },
      EPSG_4167: {
        towgs84: "0,0,0"
      },
      EPSG_4189: {
        towgs84: "0,0,0"
      },
      EPSG_4190: {
        towgs84: "0,0,0"
      },
      EPSG_4176: {
        towgs84: "0,0,0"
      },
      EPSG_4659: {
        towgs84: "0,0,0"
      },
      EPSG_3824: {
        towgs84: "0,0,0"
      },
      EPSG_3889: {
        towgs84: "0,0,0"
      },
      EPSG_4046: {
        towgs84: "0,0,0"
      },
      EPSG_4081: {
        towgs84: "0,0,0"
      },
      EPSG_4558: {
        towgs84: "0,0,0"
      },
      EPSG_4483: {
        towgs84: "0,0,0"
      },
      EPSG_5013: {
        towgs84: "0,0,0"
      },
      EPSG_5264: {
        towgs84: "0,0,0"
      },
      EPSG_5324: {
        towgs84: "0,0,0"
      },
      EPSG_5354: {
        towgs84: "0,0,0"
      },
      EPSG_5371: {
        towgs84: "0,0,0"
      },
      EPSG_5373: {
        towgs84: "0,0,0"
      },
      EPSG_5381: {
        towgs84: "0,0,0"
      },
      EPSG_5393: {
        towgs84: "0,0,0"
      },
      EPSG_5489: {
        towgs84: "0,0,0"
      },
      EPSG_5593: {
        towgs84: "0,0,0"
      },
      EPSG_6135: {
        towgs84: "0,0,0"
      },
      EPSG_6365: {
        towgs84: "0,0,0"
      },
      EPSG_5246: {
        towgs84: "0,0,0"
      },
      EPSG_7886: {
        towgs84: "0,0,0"
      },
      EPSG_8431: {
        towgs84: "0,0,0"
      },
      EPSG_8427: {
        towgs84: "0,0,0"
      },
      EPSG_8699: {
        towgs84: "0,0,0"
      },
      EPSG_8818: {
        towgs84: "0,0,0"
      },
      EPSG_4757: {
        towgs84: "0,0,0"
      },
      EPSG_9140: {
        towgs84: "0,0,0"
      },
      EPSG_8086: {
        towgs84: "0,0,0"
      },
      EPSG_4686: {
        towgs84: "0,0,0"
      },
      EPSG_4737: {
        towgs84: "0,0,0"
      },
      EPSG_4702: {
        towgs84: "0,0,0"
      },
      EPSG_4747: {
        towgs84: "0,0,0"
      },
      EPSG_4749: {
        towgs84: "0,0,0"
      },
      EPSG_4674: {
        towgs84: "0,0,0"
      },
      EPSG_4755: {
        towgs84: "0,0,0"
      },
      EPSG_4759: {
        towgs84: "0,0,0"
      },
      EPSG_4762: {
        towgs84: "0,0,0"
      },
      EPSG_4763: {
        towgs84: "0,0,0"
      },
      EPSG_4764: {
        towgs84: "0,0,0"
      },
      EPSG_4166: {
        towgs84: "0,0,0"
      },
      EPSG_4170: {
        towgs84: "0,0,0"
      },
      EPSG_5546: {
        towgs84: "0,0,0"
      },
      EPSG_7844: {
        towgs84: "0,0,0"
      },
      EPSG_4818: {
        towgs84: "589,76,480"
      },
      EPSG_10328: {
        towgs84: "0,0,0"
      },
      EPSG_9782: {
        towgs84: "0,0,0"
      },
      EPSG_9777: {
        towgs84: "0,0,0"
      },
      EPSG_10690: {
        towgs84: "0,0,0"
      },
      EPSG_10639: {
        towgs84: "0,0,0"
      },
      EPSG_10739: {
        towgs84: "0,0,0"
      },
      EPSG_7686: {
        towgs84: "0,0,0"
      },
      EPSG_8900: {
        towgs84: "0,0,0"
      },
      EPSG_5886: {
        towgs84: "0,0,0"
      },
      EPSG_7683: {
        towgs84: "0,0,0"
      },
      EPSG_6668: {
        towgs84: "0,0,0"
      },
      EPSG_20046: {
        towgs84: "0,0,0"
      },
      EPSG_10299: {
        towgs84: "0,0,0"
      },
      EPSG_10310: {
        towgs84: "0,0,0"
      },
      EPSG_10475: {
        towgs84: "0,0,0"
      },
      EPSG_4742: {
        towgs84: "0,0,0"
      },
      EPSG_10671: {
        towgs84: "0,0,0"
      },
      EPSG_10762: {
        towgs84: "0,0,0"
      },
      EPSG_10725: {
        towgs84: "0,0,0"
      },
      EPSG_10791: {
        towgs84: "0,0,0"
      },
      EPSG_10800: {
        towgs84: "0,0,0"
      },
      EPSG_10305: {
        towgs84: "0,0,0"
      },
      EPSG_10941: {
        towgs84: "0,0,0"
      },
      EPSG_10968: {
        towgs84: "0,0,0"
      },
      EPSG_10875: {
        towgs84: "0,0,0"
      },
      EPSG_6318: {
        towgs84: "0,0,0"
      },
      EPSG_10910: {
        towgs84: "0,0,0"
      }
    };
    for (key in datums) {
      datum2 = datums[key];
      if (!datum2.datumName) {
        continue;
      }
      datums[datum2.datumName] = datum2;
    }
    Datum_default = datums;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/datum.js
function datum(datumCode, datum_params, a, b, es, ep2, nadgrids) {
  var out = {};
  out.datum_type = PJD_NODATUM;
  if (datum_params) {
    out.datum_type = PJD_WGS84;
    out.datum_params = datum_params.map(parseFloat);
    if (out.datum_params[0] !== 0 || out.datum_params[1] !== 0 || out.datum_params[2] !== 0) {
      out.datum_type = PJD_3PARAM;
    }
    if (out.datum_params.length > 3) {
      if (out.datum_params[3] !== 0 || out.datum_params[4] !== 0 || out.datum_params[5] !== 0 || out.datum_params[6] !== 0) {
        out.datum_type = PJD_7PARAM;
        out.datum_params[3] *= SEC_TO_RAD;
        out.datum_params[4] *= SEC_TO_RAD;
        out.datum_params[5] *= SEC_TO_RAD;
        out.datum_params[6] = out.datum_params[6] / 1e6 + 1;
      }
    }
  }
  if (nadgrids) {
    out.datum_type = PJD_GRIDSHIFT;
    out.grids = nadgrids;
  }
  out.a = a;
  out.b = b;
  out.es = es;
  out.ep2 = ep2;
  return out;
}
var datum_default;
var init_datum = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/datum.js"() {
    init_values();
    datum_default = datum;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/nadgrid.js
function nadgrid(key, data, options) {
  if (data instanceof ArrayBuffer) {
    return readNTV2Grid(key, data, options);
  }
  return { ready: readGeotiffGrid(key, data) };
}
function readNTV2Grid(key, data, options) {
  var includeErrorFields = true;
  if (options !== void 0 && options.includeErrorFields === false) {
    includeErrorFields = false;
  }
  var view = new DataView(data);
  var isLittleEndian = detectLittleEndian(view);
  var header = readHeader(view, isLittleEndian);
  var subgrids = readSubgrids(view, header, isLittleEndian, includeErrorFields);
  var nadgrid2 = { header, subgrids };
  loadedNadgrids[key] = nadgrid2;
  return nadgrid2;
}
async function readGeotiffGrid(key, tiff) {
  var subgrids = [];
  var subGridCount = await tiff.getImageCount();
  for (var subgridIndex = subGridCount - 1; subgridIndex >= 0; subgridIndex--) {
    var image = await tiff.getImage(subgridIndex);
    var rasters = await image.readRasters();
    var data = rasters;
    var lim = [image.getWidth(), image.getHeight()];
    var imageBBoxRadians = image.getBoundingBox().map(degreesToRadians);
    var modelPixelScale = typeof image.fileDirectory.getValue === "function" ? image.fileDirectory.getValue("ModelPixelScale") : (
      /** @type {any} */
      image.fileDirectory.ModelPixelScale
    );
    var del = [modelPixelScale[0], modelPixelScale[1]].map(degreesToRadians);
    var maxX = imageBBoxRadians[0] + (lim[0] - 1) * del[0];
    var minY = imageBBoxRadians[3] - (lim[1] - 1) * del[1];
    var latitudeOffsetBand = data[0];
    var longitudeOffsetBand = data[1];
    var nodes = [];
    for (let i = lim[1] - 1; i >= 0; i--) {
      for (let j = lim[0] - 1; j >= 0; j--) {
        var index = i * lim[0] + j;
        nodes.push([-secondsToRadians(longitudeOffsetBand[index]), secondsToRadians(latitudeOffsetBand[index])]);
      }
    }
    subgrids.push({
      del,
      lim,
      ll: [-maxX, minY],
      cvs: nodes
    });
  }
  var tifGrid = {
    header: {
      nSubgrids: subGridCount
    },
    subgrids
  };
  loadedNadgrids[key] = tifGrid;
  return tifGrid;
}
function getNadgrids(nadgrids) {
  if (nadgrids === void 0) {
    return null;
  }
  var grids = nadgrids.split(",");
  return grids.map(parseNadgridString);
}
function parseNadgridString(value) {
  if (value.length === 0) {
    return null;
  }
  var optional = value[0] === "@";
  if (optional) {
    value = value.slice(1);
  }
  if (value === "null") {
    return { name: "null", mandatory: !optional, grid: null, isNull: true };
  }
  return {
    name: value,
    mandatory: !optional,
    grid: loadedNadgrids[value] || null,
    isNull: false
  };
}
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}
function secondsToRadians(seconds) {
  return seconds / 3600 * Math.PI / 180;
}
function detectLittleEndian(view) {
  var nFields = view.getInt32(8, false);
  if (nFields === 11) {
    return false;
  }
  nFields = view.getInt32(8, true);
  if (nFields !== 11) {
    console.warn("Failed to detect nadgrid endian-ness, defaulting to little-endian");
  }
  return true;
}
function readHeader(view, isLittleEndian) {
  return {
    nFields: view.getInt32(8, isLittleEndian),
    nSubgridFields: view.getInt32(24, isLittleEndian),
    nSubgrids: view.getInt32(40, isLittleEndian),
    shiftType: decodeString(view, 56, 56 + 8).trim(),
    fromSemiMajorAxis: view.getFloat64(120, isLittleEndian),
    fromSemiMinorAxis: view.getFloat64(136, isLittleEndian),
    toSemiMajorAxis: view.getFloat64(152, isLittleEndian),
    toSemiMinorAxis: view.getFloat64(168, isLittleEndian)
  };
}
function decodeString(view, start2, end) {
  return String.fromCharCode.apply(null, new Uint8Array(view.buffer.slice(start2, end)));
}
function readSubgrids(view, header, isLittleEndian, includeErrorFields) {
  var gridOffset = 176;
  var grids = [];
  for (var i = 0; i < header.nSubgrids; i++) {
    var subHeader = readGridHeader(view, gridOffset, isLittleEndian);
    var nodes = readGridNodes(view, gridOffset, subHeader, isLittleEndian, includeErrorFields);
    var lngColumnCount = Math.round(
      1 + (subHeader.upperLongitude - subHeader.lowerLongitude) / subHeader.longitudeInterval
    );
    var latColumnCount = Math.round(
      1 + (subHeader.upperLatitude - subHeader.lowerLatitude) / subHeader.latitudeInterval
    );
    grids.push({
      ll: [secondsToRadians(subHeader.lowerLongitude), secondsToRadians(subHeader.lowerLatitude)],
      del: [secondsToRadians(subHeader.longitudeInterval), secondsToRadians(subHeader.latitudeInterval)],
      lim: [lngColumnCount, latColumnCount],
      count: subHeader.gridNodeCount,
      cvs: mapNodes(nodes)
    });
    var rowSize = 16;
    if (includeErrorFields === false) {
      rowSize = 8;
    }
    gridOffset += 176 + subHeader.gridNodeCount * rowSize;
  }
  return grids;
}
function mapNodes(nodes) {
  return nodes.map(function(r) {
    return [secondsToRadians(r.longitudeShift), secondsToRadians(r.latitudeShift)];
  });
}
function readGridHeader(view, offset, isLittleEndian) {
  return {
    name: decodeString(view, offset + 8, offset + 16).trim(),
    parent: decodeString(view, offset + 24, offset + 24 + 8).trim(),
    lowerLatitude: view.getFloat64(offset + 72, isLittleEndian),
    upperLatitude: view.getFloat64(offset + 88, isLittleEndian),
    lowerLongitude: view.getFloat64(offset + 104, isLittleEndian),
    upperLongitude: view.getFloat64(offset + 120, isLittleEndian),
    latitudeInterval: view.getFloat64(offset + 136, isLittleEndian),
    longitudeInterval: view.getFloat64(offset + 152, isLittleEndian),
    gridNodeCount: view.getInt32(offset + 168, isLittleEndian)
  };
}
function readGridNodes(view, offset, gridHeader, isLittleEndian, includeErrorFields) {
  var nodesOffset = offset + 176;
  var gridRecordLength = 16;
  if (includeErrorFields === false) {
    gridRecordLength = 8;
  }
  var gridShiftRecords = [];
  for (var i = 0; i < gridHeader.gridNodeCount; i++) {
    var record = {
      latitudeShift: view.getFloat32(nodesOffset + i * gridRecordLength, isLittleEndian),
      longitudeShift: view.getFloat32(nodesOffset + i * gridRecordLength + 4, isLittleEndian)
    };
    if (includeErrorFields !== false) {
      record.latitudeAccuracy = view.getFloat32(nodesOffset + i * gridRecordLength + 8, isLittleEndian);
      record.longitudeAccuracy = view.getFloat32(nodesOffset + i * gridRecordLength + 12, isLittleEndian);
    }
    gridShiftRecords.push(record);
  }
  return gridShiftRecords;
}
var loadedNadgrids;
var init_nadgrid = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/nadgrid.js"() {
    loadedNadgrids = {};
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/Proj.js
function Projection(srsCode, callback) {
  if (!(this instanceof Projection)) {
    return new Projection(srsCode);
  }
  this.forward = null;
  this.inverse = null;
  this.init = null;
  this.name;
  this.axis;
  this.names = null;
  this.title;
  callback = callback || function(error) {
    if (error) {
      throw error;
    }
  };
  var json = parseCode_default(srsCode);
  if (typeof json !== "object") {
    callback("Could not parse to valid json: " + srsCode);
    return;
  }
  var ourProj = Projection.projections.get(json.projName);
  if (!ourProj) {
    callback("Could not get projection name from: " + srsCode);
    return;
  }
  if (json.datumCode && json.datumCode !== "none") {
    var datumDef = match(Datum_default, json.datumCode);
    if (datumDef) {
      json.datum_params = json.datum_params || (datumDef.towgs84 ? datumDef.towgs84.split(",") : null);
      json.ellps = datumDef.ellipse;
      json.datumName = datumDef.datumName ? datumDef.datumName : json.datumCode;
    }
  }
  json.k0 = json.k0 || 1;
  json.axis = json.axis || "enu";
  json.ellps = json.ellps || "wgs84";
  json.lat1 = json.lat1 || json.lat0;
  var sphere_ = sphere(json.a, json.b, json.rf, json.ellps, json.sphere);
  var ecc = eccentricity(sphere_.a, sphere_.b, sphere_.rf, json.R_A);
  var nadgrids = getNadgrids(json.nadgrids);
  var datumObj = json.datum || datum_default(
    json.datumCode,
    json.datum_params,
    sphere_.a,
    sphere_.b,
    ecc.es,
    ecc.ep2,
    nadgrids
  );
  extend_default(this, json);
  extend_default(this, ourProj);
  this.a = sphere_.a;
  this.b = sphere_.b;
  this.rf = sphere_.rf;
  this.sphere = sphere_.sphere;
  this.es = ecc.es;
  this.e = ecc.e;
  this.ep2 = ecc.ep2;
  this.datum = datumObj;
  if ("init" in this && typeof this.init === "function") {
    this.init();
  }
  callback(null, this);
}
var Proj_default;
var init_Proj = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/Proj.js"() {
    init_parseCode();
    init_extend();
    init_projections();
    init_deriveConstants();
    init_Datum();
    init_datum();
    init_match();
    init_nadgrid();
    Projection.projections = projections_default;
    Projection.projections.start();
    Proj_default = Projection;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/datumUtils.js
function compareDatums(source, dest) {
  if (source.datum_type !== dest.datum_type) {
    return false;
  } else if (source.a !== dest.a || Math.abs(source.es - dest.es) > 5e-11) {
    return false;
  } else if (source.datum_type === PJD_3PARAM) {
    return source.datum_params[0] === dest.datum_params[0] && source.datum_params[1] === dest.datum_params[1] && source.datum_params[2] === dest.datum_params[2];
  } else if (source.datum_type === PJD_7PARAM) {
    return source.datum_params[0] === dest.datum_params[0] && source.datum_params[1] === dest.datum_params[1] && source.datum_params[2] === dest.datum_params[2] && source.datum_params[3] === dest.datum_params[3] && source.datum_params[4] === dest.datum_params[4] && source.datum_params[5] === dest.datum_params[5] && source.datum_params[6] === dest.datum_params[6];
  } else {
    return true;
  }
}
function geodeticToGeocentric(p, es, a) {
  var Longitude = p.x;
  var Latitude = p.y;
  var Height = p.z ? p.z : 0;
  var Rn;
  var Sin_Lat;
  var Sin2_Lat;
  var Cos_Lat;
  if (Latitude < -HALF_PI && Latitude > -1.001 * HALF_PI) {
    Latitude = -HALF_PI;
  } else if (Latitude > HALF_PI && Latitude < 1.001 * HALF_PI) {
    Latitude = HALF_PI;
  } else if (Latitude < -HALF_PI) {
    return { x: -Infinity, y: -Infinity, z: p.z };
  } else if (Latitude > HALF_PI) {
    return { x: Infinity, y: Infinity, z: p.z };
  }
  if (Longitude > Math.PI) {
    Longitude -= 2 * Math.PI;
  }
  Sin_Lat = Math.sin(Latitude);
  Cos_Lat = Math.cos(Latitude);
  Sin2_Lat = Sin_Lat * Sin_Lat;
  Rn = a / Math.sqrt(1 - es * Sin2_Lat);
  return {
    x: (Rn + Height) * Cos_Lat * Math.cos(Longitude),
    y: (Rn + Height) * Cos_Lat * Math.sin(Longitude),
    z: (Rn * (1 - es) + Height) * Sin_Lat
  };
}
function geocentricToGeodetic(p, es, a, b) {
  var genau = 1e-12;
  var genau2 = genau * genau;
  var maxiter = 30;
  var P;
  var RR;
  var CT;
  var ST;
  var RX;
  var RK;
  var RN;
  var CPHI0;
  var SPHI0;
  var CPHI;
  var SPHI;
  var SDPHI;
  var iter;
  var X9 = p.x;
  var Y = p.y;
  var Z2 = p.z ? p.z : 0;
  var Longitude;
  var Latitude;
  var Height;
  P = Math.sqrt(X9 * X9 + Y * Y);
  RR = Math.sqrt(X9 * X9 + Y * Y + Z2 * Z2);
  if (P / a < genau) {
    Longitude = 0;
    if (RR / a < genau) {
      Latitude = HALF_PI;
      Height = -b;
      return {
        x: p.x,
        y: p.y,
        z: p.z
      };
    }
  } else {
    Longitude = Math.atan2(Y, X9);
  }
  CT = Z2 / RR;
  ST = P / RR;
  RX = 1 / Math.sqrt(1 - es * (2 - es) * ST * ST);
  CPHI0 = ST * (1 - es) * RX;
  SPHI0 = CT * RX;
  iter = 0;
  do {
    iter++;
    RN = a / Math.sqrt(1 - es * SPHI0 * SPHI0);
    Height = P * CPHI0 + Z2 * SPHI0 - RN * (1 - es * SPHI0 * SPHI0);
    RK = es * RN / (RN + Height);
    RX = 1 / Math.sqrt(1 - RK * (2 - RK) * ST * ST);
    CPHI = ST * (1 - RK) * RX;
    SPHI = CT * RX;
    SDPHI = SPHI * CPHI0 - CPHI * SPHI0;
    CPHI0 = CPHI;
    SPHI0 = SPHI;
  } while (SDPHI * SDPHI > genau2 && iter < maxiter);
  Latitude = Math.atan(SPHI / Math.abs(CPHI));
  return {
    x: Longitude,
    y: Latitude,
    z: Height
  };
}
function geocentricToWgs84(p, datum_type, datum_params) {
  if (datum_type === PJD_3PARAM) {
    return {
      x: p.x + datum_params[0],
      y: p.y + datum_params[1],
      z: p.z + datum_params[2]
    };
  } else if (datum_type === PJD_7PARAM) {
    var Dx_BF = datum_params[0];
    var Dy_BF = datum_params[1];
    var Dz_BF = datum_params[2];
    var Rx_BF = datum_params[3];
    var Ry_BF = datum_params[4];
    var Rz_BF = datum_params[5];
    var M_BF = datum_params[6];
    return {
      x: M_BF * (p.x - Rz_BF * p.y + Ry_BF * p.z) + Dx_BF,
      y: M_BF * (Rz_BF * p.x + p.y - Rx_BF * p.z) + Dy_BF,
      z: M_BF * (-Ry_BF * p.x + Rx_BF * p.y + p.z) + Dz_BF
    };
  }
}
function geocentricFromWgs84(p, datum_type, datum_params) {
  if (datum_type === PJD_3PARAM) {
    return {
      x: p.x - datum_params[0],
      y: p.y - datum_params[1],
      z: p.z - datum_params[2]
    };
  } else if (datum_type === PJD_7PARAM) {
    var Dx_BF = datum_params[0];
    var Dy_BF = datum_params[1];
    var Dz_BF = datum_params[2];
    var Rx_BF = datum_params[3];
    var Ry_BF = datum_params[4];
    var Rz_BF = datum_params[5];
    var M_BF = datum_params[6];
    var x_tmp = (p.x - Dx_BF) / M_BF;
    var y_tmp = (p.y - Dy_BF) / M_BF;
    var z_tmp = (p.z - Dz_BF) / M_BF;
    return {
      x: x_tmp + Rz_BF * y_tmp - Ry_BF * z_tmp,
      y: -Rz_BF * x_tmp + y_tmp + Rx_BF * z_tmp,
      z: Ry_BF * x_tmp - Rx_BF * y_tmp + z_tmp
    };
  }
}
var init_datumUtils = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/datumUtils.js"() {
    init_values();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/datum_transform.js
function checkParams(type) {
  return type === PJD_3PARAM || type === PJD_7PARAM;
}
function datum_transform_default(source, dest, point) {
  if (compareDatums(source, dest)) {
    return point;
  }
  if (source.datum_type === PJD_NODATUM || dest.datum_type === PJD_NODATUM) {
    return point;
  }
  var source_a = source.a;
  var source_es = source.es;
  if (source.datum_type === PJD_GRIDSHIFT) {
    var gridShiftCode = applyGridShift(source, false, point);
    if (gridShiftCode !== 0) {
      return void 0;
    }
    source_a = SRS_WGS84_SEMIMAJOR;
    source_es = SRS_WGS84_ESQUARED;
  }
  var dest_a = dest.a;
  var dest_b = dest.b;
  var dest_es = dest.es;
  if (dest.datum_type === PJD_GRIDSHIFT) {
    dest_a = SRS_WGS84_SEMIMAJOR;
    dest_b = SRS_WGS84_SEMIMINOR;
    dest_es = SRS_WGS84_ESQUARED;
  }
  if (source_es === dest_es && source_a === dest_a && !checkParams(source.datum_type) && !checkParams(dest.datum_type)) {
    return point;
  }
  point = geodeticToGeocentric(point, source_es, source_a);
  if (checkParams(source.datum_type)) {
    point = geocentricToWgs84(point, source.datum_type, source.datum_params);
  }
  if (checkParams(dest.datum_type)) {
    point = geocentricFromWgs84(point, dest.datum_type, dest.datum_params);
  }
  point = geocentricToGeodetic(point, dest_es, dest_a, dest_b);
  if (dest.datum_type === PJD_GRIDSHIFT) {
    var destGridShiftResult = applyGridShift(dest, true, point);
    if (destGridShiftResult !== 0) {
      return void 0;
    }
  }
  return point;
}
function applyGridShift(source, inverse35, point) {
  if (source.grids === null || source.grids.length === 0) {
    console.log("Grid shift grids not found");
    return -1;
  }
  var input = { x: -point.x, y: point.y };
  var output = { x: Number.NaN, y: Number.NaN };
  var attemptedGrids = [];
  outer:
    for (var i = 0; i < source.grids.length; i++) {
      var grid = source.grids[i];
      attemptedGrids.push(grid.name);
      if (grid.isNull) {
        output = input;
        break;
      }
      if (grid.grid === null) {
        if (grid.mandatory) {
          console.log("Unable to find mandatory grid '" + grid.name + "'");
          return -1;
        }
        continue;
      }
      var subgrids = grid.grid.subgrids;
      for (var j = 0, jj = subgrids.length; j < jj; j++) {
        var subgrid = subgrids[j];
        var epsilon = (Math.abs(subgrid.del[1]) + Math.abs(subgrid.del[0])) / 1e4;
        var minX = subgrid.ll[0] - epsilon;
        var minY = subgrid.ll[1] - epsilon;
        var maxX = subgrid.ll[0] + (subgrid.lim[0] - 1) * subgrid.del[0] + epsilon;
        var maxY = subgrid.ll[1] + (subgrid.lim[1] - 1) * subgrid.del[1] + epsilon;
        if (minY > input.y || minX > input.x || maxY < input.y || maxX < input.x) {
          continue;
        }
        output = applySubgridShift(input, inverse35, subgrid);
        if (!isNaN(output.x)) {
          break outer;
        }
      }
    }
  if (isNaN(output.x)) {
    console.log("Failed to find a grid shift table for location '" + -input.x * R2D + " " + input.y * R2D + " tried: '" + attemptedGrids + "'");
    return -1;
  }
  point.x = -output.x;
  point.y = output.y;
  return 0;
}
function applySubgridShift(pin, inverse35, ct) {
  var val = { x: Number.NaN, y: Number.NaN };
  if (isNaN(pin.x)) {
    return val;
  }
  var tb = { x: pin.x, y: pin.y };
  tb.x -= ct.ll[0];
  tb.y -= ct.ll[1];
  tb.x = adjust_lon_default(tb.x - Math.PI) + Math.PI;
  var t = nadInterpolate(tb, ct);
  if (inverse35) {
    if (isNaN(t.x)) {
      return val;
    }
    t.x = tb.x - t.x;
    t.y = tb.y - t.y;
    var i = 9, tol = 1e-12;
    var dif, del;
    do {
      del = nadInterpolate(t, ct);
      if (isNaN(del.x)) {
        console.log("Inverse grid shift iteration failed, presumably at grid edge.  Using first approximation.");
        break;
      }
      dif = { x: tb.x - (del.x + t.x), y: tb.y - (del.y + t.y) };
      t.x += dif.x;
      t.y += dif.y;
    } while (i-- && Math.abs(dif.x) > tol && Math.abs(dif.y) > tol);
    if (i < 0) {
      console.log("Inverse grid shift iterator failed to converge.");
      return val;
    }
    val.x = adjust_lon_default(t.x + ct.ll[0]);
    val.y = t.y + ct.ll[1];
  } else {
    if (!isNaN(t.x)) {
      val.x = pin.x + t.x;
      val.y = pin.y + t.y;
    }
  }
  return val;
}
function nadInterpolate(pin, ct) {
  var t = { x: pin.x / ct.del[0], y: pin.y / ct.del[1] };
  var indx = { x: Math.floor(t.x), y: Math.floor(t.y) };
  var frct = { x: t.x - 1 * indx.x, y: t.y - 1 * indx.y };
  var val = { x: Number.NaN, y: Number.NaN };
  var inx;
  if (indx.x < 0 || indx.x >= ct.lim[0]) {
    return val;
  }
  if (indx.y < 0 || indx.y >= ct.lim[1]) {
    return val;
  }
  inx = indx.y * ct.lim[0] + indx.x;
  var f00 = { x: ct.cvs[inx][0], y: ct.cvs[inx][1] };
  inx++;
  var f10 = { x: ct.cvs[inx][0], y: ct.cvs[inx][1] };
  inx += ct.lim[0];
  var f11 = { x: ct.cvs[inx][0], y: ct.cvs[inx][1] };
  inx--;
  var f01 = { x: ct.cvs[inx][0], y: ct.cvs[inx][1] };
  var m11 = frct.x * frct.y, m10 = frct.x * (1 - frct.y), m00 = (1 - frct.x) * (1 - frct.y), m01 = (1 - frct.x) * frct.y;
  val.x = m00 * f00.x + m10 * f10.x + m01 * f01.x + m11 * f11.x;
  val.y = m00 * f00.y + m10 * f10.y + m01 * f01.y + m11 * f11.y;
  return val;
}
var init_datum_transform = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/datum_transform.js"() {
    init_values();
    init_datumUtils();
    init_adjust_lon();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/adjust_axis.js
function adjustAxisToEnu(crs, point) {
  const out = {};
  for (let i = 0, ii = crs.axis.length; i < ii; i++) {
    if (i === 2 && point.z === void 0) {
      continue;
    }
    let v = point[order[i]];
    switch (crs.axis[i]) {
      case "e":
        out.x = v;
        break;
      case "w":
        out.x = -v;
        break;
      case "n":
        out.y = v;
        break;
      case "s":
        out.y = -v;
        break;
      case "u":
        out.z = v;
        break;
      case "d":
        out.z = -v;
        break;
      default:
        return null;
    }
  }
  return out;
}
function adjustAxisFromEnu(crs, point) {
  const out = (
    /** @type {import("./core").InterfaceCoordinates} */
    {}
  );
  for (let i = 0, ii = crs.axis.length; i < ii; i++) {
    if (i === 2 && point.z === void 0) {
      continue;
    }
    switch (crs.axis[i]) {
      case "e":
        out[order[i]] = point.x;
        break;
      case "w":
        out[order[i]] = -point.x;
        break;
      case "n":
        out[order[i]] = point.y;
        break;
      case "s":
        out[order[i]] = -point.y;
        break;
      case "u":
        out[order[i]] = point.z;
        break;
      case "d":
        out[order[i]] = -point.z;
        break;
      default:
        return null;
    }
  }
  return out;
}
var order;
var init_adjust_axis = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/adjust_axis.js"() {
    order = ["x", "y", "z"];
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/toPoint.js
function toPoint_default(array) {
  var out = {
    x: array[0],
    y: array[1]
  };
  if (array.length > 2) {
    out.z = array[2];
  }
  if (array.length > 3) {
    out.m = array[3];
  }
  return out;
}
var init_toPoint = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/toPoint.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/checkSanity.js
function checkSanity_default(point) {
  checkCoord(point.x);
  checkCoord(point.y);
}
function checkCoord(num) {
  if (typeof Number.isFinite === "function") {
    if (Number.isFinite(num)) {
      return;
    }
    throw new TypeError("coordinates must be finite numbers");
  }
  if (typeof num !== "number" || num !== num || !isFinite(num)) {
    throw new TypeError("coordinates must be finite numbers");
  }
}
var init_checkSanity = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/checkSanity.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/transform.js
function checkNotWGS(source, dest) {
  return (source.datum.datum_type === PJD_3PARAM || source.datum.datum_type === PJD_7PARAM || source.datum.datum_type === PJD_GRIDSHIFT) && dest.datumCode !== "WGS84" || (dest.datum.datum_type === PJD_3PARAM || dest.datum.datum_type === PJD_7PARAM || dest.datum.datum_type === PJD_GRIDSHIFT) && source.datumCode !== "WGS84";
}
function transformInternal(source, dest, point, enforceAxis) {
  var wgs842;
  var hasZ = point.z !== void 0;
  checkSanity_default(point);
  if (source.datum && dest.datum && checkNotWGS(source, dest)) {
    wgs842 = new Proj_default("WGS84");
    point = transformInternal(source, wgs842, point, enforceAxis);
    source = wgs842;
  }
  if (enforceAxis && source.axis !== "enu") {
    point = adjustAxisToEnu(source, point);
  }
  if (source.projName === "longlat") {
    point = {
      x: point.x * D2R,
      y: point.y * D2R,
      z: point.z || 0
    };
  } else {
    if (source.to_meter) {
      point = {
        x: point.x * source.to_meter,
        y: point.y * source.to_meter,
        z: point.z || 0
      };
    }
    point = source.inverse(point);
    if (!point) {
      return;
    }
  }
  if (source.from_greenwich) {
    point.x += source.from_greenwich;
  }
  point = datum_transform_default(source.datum, dest.datum, point);
  if (!point) {
    return;
  }
  point = /** @type {import('./core').InterfaceCoordinates} */
  point;
  if (dest.from_greenwich) {
    point = {
      x: point.x - dest.from_greenwich,
      y: point.y,
      z: point.z || 0
    };
  }
  if (dest.projName === "longlat") {
    point = {
      x: point.x * R2D,
      y: point.y * R2D,
      z: point.z || 0
    };
  } else {
    point = dest.forward(point);
    if (dest.to_meter) {
      point = {
        x: point.x / dest.to_meter,
        y: point.y / dest.to_meter,
        z: point.z || 0
      };
    }
  }
  if (enforceAxis && dest.axis !== "enu") {
    return adjustAxisFromEnu(dest, point);
  }
  if (point && !hasZ && dest.projName !== "geocent") {
    delete point.z;
  }
  return point;
}
function transform(source, dest, point, enforceAxis) {
  var pt;
  if (Array.isArray(point)) {
    pt = toPoint_default(point);
  } else {
    pt = { x: point.x, y: point.y, z: point.z, m: point.m };
  }
  return transformInternal(source, dest, pt, enforceAxis);
}
var init_transform = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/transform.js"() {
    init_values();
    init_datum_transform();
    init_adjust_axis();
    init_Proj();
    init_toPoint();
    init_checkSanity();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/core.js
function transformer(from, to, coords, enforceAxis) {
  var out, geocent, keys;
  if (Array.isArray(coords)) {
    out = transformInternal(from, to, toPoint_default(coords), enforceAxis) || { x: NaN, y: NaN };
    if (coords.length > 2) {
      geocent = typeof from.name !== "undefined" && from.name === "geocent" || typeof to.name !== "undefined" && to.name === "geocent";
      if (geocent) {
        if (typeof out.z === "number") {
          return (
            /** @type {T} */
            [out.x, out.y, out.z].concat(coords.slice(3))
          );
        }
        return (
          /** @type {T} */
          [out.x, out.y, coords[2]].concat(coords.slice(3))
        );
      }
      if (enforceAxis && typeof out.z === "number") {
        return (
          /** @type {T} */
          [out.x, out.y, out.z].concat(coords.slice(3))
        );
      }
      return (
        /** @type {T} */
        [out.x, out.y].concat(coords.slice(2))
      );
    }
    return (
      /** @type {T} */
      [out.x, out.y]
    );
  } else {
    out = transformInternal(from, to, { x: coords.x, y: coords.y, z: coords.z, m: coords.m }, enforceAxis) || { x: NaN, y: NaN };
    keys = Object.keys(coords);
    if (keys.length === 2) {
      return (
        /** @type {T} */
        out
      );
    }
    geocent = typeof from.name !== "undefined" && from.name === "geocent" || typeof to.name !== "undefined" && to.name === "geocent";
    keys.forEach(function(key) {
      if (key === "x" || key === "y") {
        return;
      }
      if (key === "z" && (geocent || enforceAxis)) {
        return;
      }
      out[key] = coords[key];
    });
    return (
      /** @type {T} */
      out
    );
  }
}
function checkProj(item) {
  if (item instanceof Proj_default) {
    return item;
  }
  if (typeof item === "object" && "oProj" in item) {
    return item.oProj;
  }
  return Proj_default(
    /** @type {string | PROJJSONDefinition} */
    item
  );
}
function proj4(fromProjOrToProj, toProjOrCoord, coord) {
  var fromProj;
  var toProj;
  var single = false;
  var obj;
  if (typeof toProjOrCoord === "undefined") {
    toProj = checkProj(fromProjOrToProj);
    fromProj = wgs84;
    single = true;
  } else if (typeof /** @type {?} */
  toProjOrCoord.x !== "undefined" || Array.isArray(toProjOrCoord)) {
    coord = /** @type {T} */
    /** @type {?} */
    toProjOrCoord;
    toProj = checkProj(fromProjOrToProj);
    fromProj = wgs84;
    single = true;
  }
  if (!fromProj) {
    fromProj = checkProj(fromProjOrToProj);
  }
  if (!toProj) {
    toProj = checkProj(
      /** @type {string | PROJJSONDefinition | proj } */
      toProjOrCoord
    );
  }
  if (coord) {
    return transformer(fromProj, toProj, coord);
  } else {
    obj = {
      /**
       * @template {TemplateCoordinates} T
       * @param {T} coords
       * @param {boolean=} enforceAxis
       * @returns {T}
       */
      forward: function(coords, enforceAxis) {
        return transformer(fromProj, toProj, coords, enforceAxis);
      },
      /**
       * @template {TemplateCoordinates} T
       * @param {T} coords
       * @param {boolean=} enforceAxis
       * @returns {T}
       */
      inverse: function(coords, enforceAxis) {
        return transformer(toProj, fromProj, coords, enforceAxis);
      }
    };
    if (single) {
      obj.oProj = toProj;
    }
    return obj;
  }
}
var wgs84, core_default;
var init_core = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/core.js"() {
    init_Proj();
    init_transform();
    init_toPoint();
    wgs84 = Proj_default("WGS84");
    core_default = proj4;
  }
});

// ../../node_modules/.pnpm/mgrs@1.0.0/node_modules/mgrs/mgrs.js
function forward2(ll, accuracy) {
  accuracy = accuracy || 5;
  return encode(LLtoUTM({
    lat: ll[1],
    lon: ll[0]
  }), accuracy);
}
function inverse2(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat, bbox.lon, bbox.lat];
  }
  return [bbox.left, bbox.bottom, bbox.right, bbox.top];
}
function toPoint(mgrs) {
  var bbox = UTMtoLL(decode(mgrs.toUpperCase()));
  if (bbox.lat && bbox.lon) {
    return [bbox.lon, bbox.lat];
  }
  return [(bbox.left + bbox.right) / 2, (bbox.top + bbox.bottom) / 2];
}
function degToRad(deg) {
  return deg * (Math.PI / 180);
}
function radToDeg(rad) {
  return 180 * (rad / Math.PI);
}
function LLtoUTM(ll) {
  var Lat = ll.lat;
  var Long = ll.lon;
  var a = 6378137;
  var eccSquared = 669438e-8;
  var k0 = 0.9996;
  var LongOrigin;
  var eccPrimeSquared;
  var N, T, C, A5, M2;
  var LatRad = degToRad(Lat);
  var LongRad = degToRad(Long);
  var LongOriginRad;
  var ZoneNumber;
  ZoneNumber = Math.floor((Long + 180) / 6) + 1;
  if (Long === 180) {
    ZoneNumber = 60;
  }
  if (Lat >= 56 && Lat < 64 && Long >= 3 && Long < 12) {
    ZoneNumber = 32;
  }
  if (Lat >= 72 && Lat < 84) {
    if (Long >= 0 && Long < 9) {
      ZoneNumber = 31;
    } else if (Long >= 9 && Long < 21) {
      ZoneNumber = 33;
    } else if (Long >= 21 && Long < 33) {
      ZoneNumber = 35;
    } else if (Long >= 33 && Long < 42) {
      ZoneNumber = 37;
    }
  }
  LongOrigin = (ZoneNumber - 1) * 6 - 180 + 3;
  LongOriginRad = degToRad(LongOrigin);
  eccPrimeSquared = eccSquared / (1 - eccSquared);
  N = a / Math.sqrt(1 - eccSquared * Math.sin(LatRad) * Math.sin(LatRad));
  T = Math.tan(LatRad) * Math.tan(LatRad);
  C = eccPrimeSquared * Math.cos(LatRad) * Math.cos(LatRad);
  A5 = Math.cos(LatRad) * (LongRad - LongOriginRad);
  M2 = a * ((1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256) * LatRad - (3 * eccSquared / 8 + 3 * eccSquared * eccSquared / 32 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(2 * LatRad) + (15 * eccSquared * eccSquared / 256 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(4 * LatRad) - 35 * eccSquared * eccSquared * eccSquared / 3072 * Math.sin(6 * LatRad));
  var UTMEasting = k0 * N * (A5 + (1 - T + C) * A5 * A5 * A5 / 6 + (5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A5 * A5 * A5 * A5 * A5 / 120) + 5e5;
  var UTMNorthing = k0 * (M2 + N * Math.tan(LatRad) * (A5 * A5 / 2 + (5 - T + 9 * C + 4 * C * C) * A5 * A5 * A5 * A5 / 24 + (61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * A5 * A5 * A5 * A5 * A5 * A5 / 720));
  if (Lat < 0) {
    UTMNorthing += 1e7;
  }
  return {
    northing: Math.round(UTMNorthing),
    easting: Math.round(UTMEasting),
    zoneNumber: ZoneNumber,
    zoneLetter: getLetterDesignator(Lat)
  };
}
function UTMtoLL(utm) {
  var UTMNorthing = utm.northing;
  var UTMEasting = utm.easting;
  var zoneLetter = utm.zoneLetter;
  var zoneNumber = utm.zoneNumber;
  if (zoneNumber < 0 || zoneNumber > 60) {
    return null;
  }
  var k0 = 0.9996;
  var a = 6378137;
  var eccSquared = 669438e-8;
  var eccPrimeSquared;
  var e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  var N1, T1, C12, R1, D, M2;
  var LongOrigin;
  var mu, phi1Rad;
  var x = UTMEasting - 5e5;
  var y = UTMNorthing;
  if (zoneLetter < "N") {
    y -= 1e7;
  }
  LongOrigin = (zoneNumber - 1) * 6 - 180 + 3;
  eccPrimeSquared = eccSquared / (1 - eccSquared);
  M2 = y / k0;
  mu = M2 / (a * (1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256));
  phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + 151 * e1 * e1 * e1 / 96 * Math.sin(6 * mu);
  N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
  T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
  C12 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
  R1 = a * (1 - eccSquared) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
  D = x / (N1 * k0);
  var lat = phi1Rad - N1 * Math.tan(phi1Rad) / R1 * (D * D / 2 - (5 + 3 * T1 + 10 * C12 - 4 * C12 * C12 - 9 * eccPrimeSquared) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C12 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C12 * C12) * D * D * D * D * D * D / 720);
  lat = radToDeg(lat);
  var lon = (D - (1 + 2 * T1 + C12) * D * D * D / 6 + (5 - 2 * C12 + 28 * T1 - 3 * C12 * C12 + 8 * eccPrimeSquared + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1Rad);
  lon = LongOrigin + radToDeg(lon);
  var result;
  if (utm.accuracy) {
    var topRight = UTMtoLL({
      northing: utm.northing + utm.accuracy,
      easting: utm.easting + utm.accuracy,
      zoneLetter: utm.zoneLetter,
      zoneNumber: utm.zoneNumber
    });
    result = {
      top: topRight.lat,
      right: topRight.lon,
      bottom: lat,
      left: lon
    };
  } else {
    result = {
      lat,
      lon
    };
  }
  return result;
}
function getLetterDesignator(lat) {
  var LetterDesignator = "Z";
  if (84 >= lat && lat >= 72) {
    LetterDesignator = "X";
  } else if (72 > lat && lat >= 64) {
    LetterDesignator = "W";
  } else if (64 > lat && lat >= 56) {
    LetterDesignator = "V";
  } else if (56 > lat && lat >= 48) {
    LetterDesignator = "U";
  } else if (48 > lat && lat >= 40) {
    LetterDesignator = "T";
  } else if (40 > lat && lat >= 32) {
    LetterDesignator = "S";
  } else if (32 > lat && lat >= 24) {
    LetterDesignator = "R";
  } else if (24 > lat && lat >= 16) {
    LetterDesignator = "Q";
  } else if (16 > lat && lat >= 8) {
    LetterDesignator = "P";
  } else if (8 > lat && lat >= 0) {
    LetterDesignator = "N";
  } else if (0 > lat && lat >= -8) {
    LetterDesignator = "M";
  } else if (-8 > lat && lat >= -16) {
    LetterDesignator = "L";
  } else if (-16 > lat && lat >= -24) {
    LetterDesignator = "K";
  } else if (-24 > lat && lat >= -32) {
    LetterDesignator = "J";
  } else if (-32 > lat && lat >= -40) {
    LetterDesignator = "H";
  } else if (-40 > lat && lat >= -48) {
    LetterDesignator = "G";
  } else if (-48 > lat && lat >= -56) {
    LetterDesignator = "F";
  } else if (-56 > lat && lat >= -64) {
    LetterDesignator = "E";
  } else if (-64 > lat && lat >= -72) {
    LetterDesignator = "D";
  } else if (-72 > lat && lat >= -80) {
    LetterDesignator = "C";
  }
  return LetterDesignator;
}
function encode(utm, accuracy) {
  var seasting = "00000" + utm.easting, snorthing = "00000" + utm.northing;
  return utm.zoneNumber + utm.zoneLetter + get100kID(utm.easting, utm.northing, utm.zoneNumber) + seasting.substr(seasting.length - 5, accuracy) + snorthing.substr(snorthing.length - 5, accuracy);
}
function get100kID(easting, northing, zoneNumber) {
  var setParm = get100kSetForZone(zoneNumber);
  var setColumn = Math.floor(easting / 1e5);
  var setRow = Math.floor(northing / 1e5) % 20;
  return getLetter100kID(setColumn, setRow, setParm);
}
function get100kSetForZone(i) {
  var setParm = i % NUM_100K_SETS;
  if (setParm === 0) {
    setParm = NUM_100K_SETS;
  }
  return setParm;
}
function getLetter100kID(column, row, parm) {
  var index = parm - 1;
  var colOrigin = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(index);
  var rowOrigin = SET_ORIGIN_ROW_LETTERS.charCodeAt(index);
  var colInt = colOrigin + column - 1;
  var rowInt = rowOrigin + row;
  var rollover = false;
  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
    rollover = true;
  }
  if (colInt === I || colOrigin < I && colInt > I || (colInt > I || colOrigin < I) && rollover) {
    colInt++;
  }
  if (colInt === O || colOrigin < O && colInt > O || (colInt > O || colOrigin < O) && rollover) {
    colInt++;
    if (colInt === I) {
      colInt++;
    }
  }
  if (colInt > Z) {
    colInt = colInt - Z + A - 1;
  }
  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
    rollover = true;
  } else {
    rollover = false;
  }
  if (rowInt === I || rowOrigin < I && rowInt > I || (rowInt > I || rowOrigin < I) && rollover) {
    rowInt++;
  }
  if (rowInt === O || rowOrigin < O && rowInt > O || (rowInt > O || rowOrigin < O) && rollover) {
    rowInt++;
    if (rowInt === I) {
      rowInt++;
    }
  }
  if (rowInt > V) {
    rowInt = rowInt - V + A - 1;
  }
  var twoLetter = String.fromCharCode(colInt) + String.fromCharCode(rowInt);
  return twoLetter;
}
function decode(mgrsString) {
  if (mgrsString && mgrsString.length === 0) {
    throw "MGRSPoint coverting from nothing";
  }
  var length = mgrsString.length;
  var hunK = null;
  var sb = "";
  var testChar;
  var i = 0;
  while (!/[A-Z]/.test(testChar = mgrsString.charAt(i))) {
    if (i >= 2) {
      throw "MGRSPoint bad conversion from: " + mgrsString;
    }
    sb += testChar;
    i++;
  }
  var zoneNumber = parseInt(sb, 10);
  if (i === 0 || i + 3 > length) {
    throw "MGRSPoint bad conversion from: " + mgrsString;
  }
  var zoneLetter = mgrsString.charAt(i++);
  if (zoneLetter <= "A" || zoneLetter === "B" || zoneLetter === "Y" || zoneLetter >= "Z" || zoneLetter === "I" || zoneLetter === "O") {
    throw "MGRSPoint zone letter " + zoneLetter + " not handled: " + mgrsString;
  }
  hunK = mgrsString.substring(i, i += 2);
  var set = get100kSetForZone(zoneNumber);
  var east100k = getEastingFromChar(hunK.charAt(0), set);
  var north100k = getNorthingFromChar(hunK.charAt(1), set);
  while (north100k < getMinNorthing(zoneLetter)) {
    north100k += 2e6;
  }
  var remainder = length - i;
  if (remainder % 2 !== 0) {
    throw "MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters" + mgrsString;
  }
  var sep = remainder / 2;
  var sepEasting = 0;
  var sepNorthing = 0;
  var accuracyBonus, sepEastingString, sepNorthingString, easting, northing;
  if (sep > 0) {
    accuracyBonus = 1e5 / Math.pow(10, sep);
    sepEastingString = mgrsString.substring(i, i + sep);
    sepEasting = parseFloat(sepEastingString) * accuracyBonus;
    sepNorthingString = mgrsString.substring(i + sep);
    sepNorthing = parseFloat(sepNorthingString) * accuracyBonus;
  }
  easting = sepEasting + east100k;
  northing = sepNorthing + north100k;
  return {
    easting,
    northing,
    zoneLetter,
    zoneNumber,
    accuracy: accuracyBonus
  };
}
function getEastingFromChar(e, set) {
  var curCol = SET_ORIGIN_COLUMN_LETTERS.charCodeAt(set - 1);
  var eastingValue = 1e5;
  var rewindMarker = false;
  while (curCol !== e.charCodeAt(0)) {
    curCol++;
    if (curCol === I) {
      curCol++;
    }
    if (curCol === O) {
      curCol++;
    }
    if (curCol > Z) {
      if (rewindMarker) {
        throw "Bad character: " + e;
      }
      curCol = A;
      rewindMarker = true;
    }
    eastingValue += 1e5;
  }
  return eastingValue;
}
function getNorthingFromChar(n, set) {
  if (n > "V") {
    throw "MGRSPoint given invalid Northing " + n;
  }
  var curRow = SET_ORIGIN_ROW_LETTERS.charCodeAt(set - 1);
  var northingValue = 0;
  var rewindMarker = false;
  while (curRow !== n.charCodeAt(0)) {
    curRow++;
    if (curRow === I) {
      curRow++;
    }
    if (curRow === O) {
      curRow++;
    }
    if (curRow > V) {
      if (rewindMarker) {
        throw "Bad character: " + n;
      }
      curRow = A;
      rewindMarker = true;
    }
    northingValue += 1e5;
  }
  return northingValue;
}
function getMinNorthing(zoneLetter) {
  var northing;
  switch (zoneLetter) {
    case "C":
      northing = 11e5;
      break;
    case "D":
      northing = 2e6;
      break;
    case "E":
      northing = 28e5;
      break;
    case "F":
      northing = 37e5;
      break;
    case "G":
      northing = 46e5;
      break;
    case "H":
      northing = 55e5;
      break;
    case "J":
      northing = 64e5;
      break;
    case "K":
      northing = 73e5;
      break;
    case "L":
      northing = 82e5;
      break;
    case "M":
      northing = 91e5;
      break;
    case "N":
      northing = 0;
      break;
    case "P":
      northing = 8e5;
      break;
    case "Q":
      northing = 17e5;
      break;
    case "R":
      northing = 26e5;
      break;
    case "S":
      northing = 35e5;
      break;
    case "T":
      northing = 44e5;
      break;
    case "U":
      northing = 53e5;
      break;
    case "V":
      northing = 62e5;
      break;
    case "W":
      northing = 7e6;
      break;
    case "X":
      northing = 79e5;
      break;
    default:
      northing = -1;
  }
  if (northing >= 0) {
    return northing;
  } else {
    throw "Invalid zone letter: " + zoneLetter;
  }
}
var NUM_100K_SETS, SET_ORIGIN_COLUMN_LETTERS, SET_ORIGIN_ROW_LETTERS, A, I, O, V, Z, mgrs_default;
var init_mgrs = __esm({
  "../../node_modules/.pnpm/mgrs@1.0.0/node_modules/mgrs/mgrs.js"() {
    NUM_100K_SETS = 6;
    SET_ORIGIN_COLUMN_LETTERS = "AJSAJS";
    SET_ORIGIN_ROW_LETTERS = "AFAFAF";
    A = 65;
    I = 73;
    O = 79;
    V = 86;
    Z = 90;
    mgrs_default = {
      forward: forward2,
      inverse: inverse2,
      toPoint
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/Point.js
function Point(x, y, z) {
  if (!(this instanceof Point)) {
    return new Point(x, y, z);
  }
  if (Array.isArray(x)) {
    this.x = x[0];
    this.y = x[1];
    this.z = x[2] || 0;
  } else if (typeof x === "object") {
    this.x = x.x;
    this.y = x.y;
    this.z = x.z || 0;
  } else if (typeof x === "string" && typeof y === "undefined") {
    var coords = x.split(",");
    this.x = parseFloat(coords[0]);
    this.y = parseFloat(coords[1]);
    this.z = parseFloat(coords[2]) || 0;
  } else {
    this.x = x;
    this.y = y;
    this.z = z || 0;
  }
  console.warn("proj4.Point will be removed in version 3, use proj4.toPoint");
}
var Point_default;
var init_Point = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/Point.js"() {
    init_mgrs();
    Point.fromMGRS = function(mgrsStr) {
      return new Point(toPoint(mgrsStr));
    };
    Point.prototype.toMGRS = function(accuracy) {
      return forward2([this.x, this.y], accuracy);
    };
    Point_default = Point;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/pj_enfn.js
function pj_enfn_default(es) {
  var en2 = [];
  en2[0] = C00 - es * (C02 + es * (C04 + es * (C06 + es * C08)));
  en2[1] = es * (C22 - es * (C04 + es * (C06 + es * C08)));
  var t = es * es;
  en2[2] = t * (C44 - es * (C46 + es * C48));
  t *= es;
  en2[3] = t * (C66 - es * C68);
  en2[4] = t * es * C88;
  return en2;
}
var C00, C02, C04, C06, C08, C22, C44, C46, C48, C66, C68, C88;
var init_pj_enfn = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/pj_enfn.js"() {
    C00 = 1;
    C02 = 0.25;
    C04 = 0.046875;
    C06 = 0.01953125;
    C08 = 0.01068115234375;
    C22 = 0.75;
    C44 = 0.46875;
    C46 = 0.013020833333333334;
    C48 = 0.007120768229166667;
    C66 = 0.3645833333333333;
    C68 = 0.005696614583333333;
    C88 = 0.3076171875;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/pj_mlfn.js
function pj_mlfn_default(phi, sphi, cphi, en2) {
  cphi *= sphi;
  sphi *= sphi;
  return en2[0] * phi - cphi * (en2[1] + sphi * (en2[2] + sphi * (en2[3] + sphi * en2[4])));
}
var init_pj_mlfn = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/pj_mlfn.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/pj_inv_mlfn.js
function pj_inv_mlfn_default(arg, es, en2) {
  var k = 1 / (1 - es);
  var phi = arg;
  for (var i = MAX_ITER; i; --i) {
    var s = Math.sin(phi);
    var t = 1 - es * s * s;
    t = (pj_mlfn_default(phi, s, Math.cos(phi), en2) - arg) * (t * Math.sqrt(t)) * k;
    phi -= t;
    if (Math.abs(t) < EPSLN) {
      return phi;
    }
  }
  return phi;
}
var MAX_ITER;
var init_pj_inv_mlfn = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/pj_inv_mlfn.js"() {
    init_pj_mlfn();
    init_values();
    MAX_ITER = 20;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/tmerc.js
function init3() {
  this.x0 = this.x0 !== void 0 ? this.x0 : 0;
  this.y0 = this.y0 !== void 0 ? this.y0 : 0;
  this.long0 = this.long0 !== void 0 ? this.long0 : 0;
  this.lat0 = this.lat0 !== void 0 ? this.lat0 : 0;
  if (this.es) {
    this.en = pj_enfn_default(this.es);
    this.ml0 = pj_mlfn_default(this.lat0, Math.sin(this.lat0), Math.cos(this.lat0), this.en);
  }
}
function forward3(p) {
  var lon = p.x;
  var lat = p.y;
  var delta_lon = adjust_lon_default(lon - this.long0, this.over);
  var con;
  var x, y;
  var sin_phi = Math.sin(lat);
  var cos_phi = Math.cos(lat);
  if (!this.es) {
    var b = cos_phi * Math.sin(delta_lon);
    if (Math.abs(Math.abs(b) - 1) < EPSLN) {
      return 93;
    } else {
      x = 0.5 * this.a * this.k0 * Math.log((1 + b) / (1 - b)) + this.x0;
      y = cos_phi * Math.cos(delta_lon) / Math.sqrt(1 - Math.pow(b, 2));
      b = Math.abs(y);
      if (b >= 1) {
        if (b - 1 > EPSLN) {
          return 93;
        } else {
          y = 0;
        }
      } else {
        y = Math.acos(y);
      }
      if (lat < 0) {
        y = -y;
      }
      y = this.a * this.k0 * (y - this.lat0) + this.y0;
    }
  } else {
    var al = cos_phi * delta_lon;
    var als = Math.pow(al, 2);
    var c = this.ep2 * Math.pow(cos_phi, 2);
    var cs = Math.pow(c, 2);
    var tq = Math.abs(cos_phi) > EPSLN ? Math.tan(lat) : 0;
    var t = Math.pow(tq, 2);
    var ts = Math.pow(t, 2);
    con = 1 - this.es * Math.pow(sin_phi, 2);
    al = al / Math.sqrt(con);
    var ml = pj_mlfn_default(lat, sin_phi, cos_phi, this.en);
    x = this.a * (this.k0 * al * (1 + als / 6 * (1 - t + c + als / 20 * (5 - 18 * t + ts + 14 * c - 58 * t * c + als / 42 * (61 + 179 * ts - ts * t - 479 * t))))) + this.x0;
    y = this.a * (this.k0 * (ml - this.ml0 + sin_phi * delta_lon * al / 2 * (1 + als / 12 * (5 - t + 9 * c + 4 * cs + als / 30 * (61 + ts - 58 * t + 270 * c - 330 * t * c + als / 56 * (1385 + 543 * ts - ts * t - 3111 * t)))))) + this.y0;
  }
  p.x = x;
  p.y = y;
  return p;
}
function inverse3(p) {
  var con, phi;
  var lat, lon;
  var x = (p.x - this.x0) * (1 / this.a);
  var y = (p.y - this.y0) * (1 / this.a);
  if (!this.es) {
    var f = Math.exp(x / this.k0);
    var g = 0.5 * (f - 1 / f);
    var temp = this.lat0 + y / this.k0;
    var h = Math.cos(temp);
    con = Math.sqrt((1 - Math.pow(h, 2)) / (1 + Math.pow(g, 2)));
    lat = Math.asin(con);
    if (y < 0) {
      lat = -lat;
    }
    if (g === 0 && h === 0) {
      lon = 0;
    } else {
      lon = adjust_lon_default(Math.atan2(g, h) + this.long0, this.over);
    }
  } else {
    con = this.ml0 + y / this.k0;
    phi = pj_inv_mlfn_default(con, this.es, this.en);
    if (Math.abs(phi) < HALF_PI) {
      var sin_phi = Math.sin(phi);
      var cos_phi = Math.cos(phi);
      var tan_phi = Math.abs(cos_phi) > EPSLN ? Math.tan(phi) : 0;
      var c = this.ep2 * Math.pow(cos_phi, 2);
      var cs = Math.pow(c, 2);
      var t = Math.pow(tan_phi, 2);
      var ts = Math.pow(t, 2);
      con = 1 - this.es * Math.pow(sin_phi, 2);
      var d = x * Math.sqrt(con) / this.k0;
      var ds = Math.pow(d, 2);
      con = con * tan_phi;
      lat = phi - con * ds / (1 - this.es) * 0.5 * (1 - ds / 12 * (5 + 3 * t - 9 * c * t + c - 4 * cs - ds / 30 * (61 + 90 * t - 252 * c * t + 45 * ts + 46 * c - ds / 56 * (1385 + 3633 * t + 4095 * ts + 1574 * ts * t))));
      lon = adjust_lon_default(this.long0 + d * (1 - ds / 6 * (1 + 2 * t + c - ds / 20 * (5 + 28 * t + 24 * ts + 8 * c * t + 6 * c - ds / 42 * (61 + 662 * t + 1320 * ts + 720 * ts * t)))) / cos_phi, this.over);
    } else {
      lat = HALF_PI * sign_default(y);
      lon = 0;
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
}
var names4, tmerc_default;
var init_tmerc = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/tmerc.js"() {
    init_pj_enfn();
    init_pj_mlfn();
    init_pj_inv_mlfn();
    init_adjust_lon();
    init_values();
    init_sign();
    names4 = ["Fast_Transverse_Mercator", "Fast Transverse Mercator"];
    tmerc_default = {
      init: init3,
      forward: forward3,
      inverse: inverse3,
      names: names4
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/sinh.js
function sinh_default(x) {
  var r = Math.exp(x);
  r = (r - 1 / r) / 2;
  return r;
}
var init_sinh = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/sinh.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/hypot.js
function hypot_default(x, y) {
  x = Math.abs(x);
  y = Math.abs(y);
  var a = Math.max(x, y);
  var b = Math.min(x, y) / (a ? a : 1);
  return a * Math.sqrt(1 + Math.pow(b, 2));
}
var init_hypot = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/hypot.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/log1py.js
function log1py_default(x) {
  var y = 1 + x;
  var z = y - 1;
  return z === 0 ? x : x * Math.log(y) / z;
}
var init_log1py = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/log1py.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/asinhy.js
function asinhy_default(x) {
  var y = Math.abs(x);
  y = log1py_default(y * (1 + y / (hypot_default(1, y) + 1)));
  return x < 0 ? -y : y;
}
var init_asinhy = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/asinhy.js"() {
    init_hypot();
    init_log1py();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/gatg.js
function gatg_default(pp, B) {
  var cos_2B = 2 * Math.cos(2 * B);
  var i = pp.length - 1;
  var h1 = pp[i];
  var h2 = 0;
  var h;
  while (--i >= 0) {
    h = -h2 + cos_2B * h1 + pp[i];
    h2 = h1;
    h1 = h;
  }
  return B + h * Math.sin(2 * B);
}
var init_gatg = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/gatg.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/clens.js
function clens_default(pp, arg_r) {
  var r = 2 * Math.cos(arg_r);
  var i = pp.length - 1;
  var hr1 = pp[i];
  var hr2 = 0;
  var hr;
  while (--i >= 0) {
    hr = -hr2 + r * hr1 + pp[i];
    hr2 = hr1;
    hr1 = hr;
  }
  return Math.sin(arg_r) * hr;
}
var init_clens = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/clens.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/cosh.js
function cosh_default(x) {
  var r = Math.exp(x);
  r = (r + 1 / r) / 2;
  return r;
}
var init_cosh = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/cosh.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/clens_cmplx.js
function clens_cmplx_default(pp, arg_r, arg_i) {
  var sin_arg_r = Math.sin(arg_r);
  var cos_arg_r = Math.cos(arg_r);
  var sinh_arg_i = sinh_default(arg_i);
  var cosh_arg_i = cosh_default(arg_i);
  var r = 2 * cos_arg_r * cosh_arg_i;
  var i = -2 * sin_arg_r * sinh_arg_i;
  var j = pp.length - 1;
  var hr = pp[j];
  var hi1 = 0;
  var hr1 = 0;
  var hi = 0;
  var hr2;
  var hi2;
  while (--j >= 0) {
    hr2 = hr1;
    hi2 = hi1;
    hr1 = hr;
    hi1 = hi;
    hr = -hr2 + r * hr1 - i * hi1 + pp[j];
    hi = -hi2 + i * hr1 + r * hi1;
  }
  r = sin_arg_r * cosh_arg_i;
  i = cos_arg_r * sinh_arg_i;
  return [r * hr - i * hi, r * hi + i * hr];
}
var init_clens_cmplx = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/clens_cmplx.js"() {
    init_sinh();
    init_cosh();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/etmerc.js
function init4() {
  if (!this.approx && (isNaN(this.es) || this.es <= 0)) {
    throw new Error('Incorrect elliptical usage. Try using the +approx option in the proj string, or PROJECTION["Fast_Transverse_Mercator"] in the WKT.');
  }
  if (this.approx) {
    tmerc_default.init.apply(this);
    this.forward = tmerc_default.forward;
    this.inverse = tmerc_default.inverse;
  }
  this.x0 = this.x0 !== void 0 ? this.x0 : 0;
  this.y0 = this.y0 !== void 0 ? this.y0 : 0;
  this.long0 = this.long0 !== void 0 ? this.long0 : 0;
  this.lat0 = this.lat0 !== void 0 ? this.lat0 : 0;
  this.cgb = [];
  this.cbg = [];
  this.utg = [];
  this.gtu = [];
  var f = this.es / (1 + Math.sqrt(1 - this.es));
  var n = f / (2 - f);
  var np = n;
  this.cgb[0] = n * (2 + n * (-2 / 3 + n * (-2 + n * (116 / 45 + n * (26 / 45 + n * (-2854 / 675))))));
  this.cbg[0] = n * (-2 + n * (2 / 3 + n * (4 / 3 + n * (-82 / 45 + n * (32 / 45 + n * (4642 / 4725))))));
  np = np * n;
  this.cgb[1] = np * (7 / 3 + n * (-8 / 5 + n * (-227 / 45 + n * (2704 / 315 + n * (2323 / 945)))));
  this.cbg[1] = np * (5 / 3 + n * (-16 / 15 + n * (-13 / 9 + n * (904 / 315 + n * (-1522 / 945)))));
  np = np * n;
  this.cgb[2] = np * (56 / 15 + n * (-136 / 35 + n * (-1262 / 105 + n * (73814 / 2835))));
  this.cbg[2] = np * (-26 / 15 + n * (34 / 21 + n * (8 / 5 + n * (-12686 / 2835))));
  np = np * n;
  this.cgb[3] = np * (4279 / 630 + n * (-332 / 35 + n * (-399572 / 14175)));
  this.cbg[3] = np * (1237 / 630 + n * (-12 / 5 + n * (-24832 / 14175)));
  np = np * n;
  this.cgb[4] = np * (4174 / 315 + n * (-144838 / 6237));
  this.cbg[4] = np * (-734 / 315 + n * (109598 / 31185));
  np = np * n;
  this.cgb[5] = np * (601676 / 22275);
  this.cbg[5] = np * (444337 / 155925);
  np = Math.pow(n, 2);
  this.Qn = this.k0 / (1 + n) * (1 + np * (1 / 4 + np * (1 / 64 + np / 256)));
  this.utg[0] = n * (-0.5 + n * (2 / 3 + n * (-37 / 96 + n * (1 / 360 + n * (81 / 512 + n * (-96199 / 604800))))));
  this.gtu[0] = n * (0.5 + n * (-2 / 3 + n * (5 / 16 + n * (41 / 180 + n * (-127 / 288 + n * (7891 / 37800))))));
  this.utg[1] = np * (-1 / 48 + n * (-1 / 15 + n * (437 / 1440 + n * (-46 / 105 + n * (1118711 / 3870720)))));
  this.gtu[1] = np * (13 / 48 + n * (-3 / 5 + n * (557 / 1440 + n * (281 / 630 + n * (-1983433 / 1935360)))));
  np = np * n;
  this.utg[2] = np * (-17 / 480 + n * (37 / 840 + n * (209 / 4480 + n * (-5569 / 90720))));
  this.gtu[2] = np * (61 / 240 + n * (-103 / 140 + n * (15061 / 26880 + n * (167603 / 181440))));
  np = np * n;
  this.utg[3] = np * (-4397 / 161280 + n * (11 / 504 + n * (830251 / 7257600)));
  this.gtu[3] = np * (49561 / 161280 + n * (-179 / 168 + n * (6601661 / 7257600)));
  np = np * n;
  this.utg[4] = np * (-4583 / 161280 + n * (108847 / 3991680));
  this.gtu[4] = np * (34729 / 80640 + n * (-3418889 / 1995840));
  np = np * n;
  this.utg[5] = np * (-20648693 / 638668800);
  this.gtu[5] = np * (212378941 / 319334400);
  var Z2 = gatg_default(this.cbg, this.lat0);
  this.Zb = -this.Qn * (Z2 + clens_default(this.gtu, 2 * Z2));
}
function forward4(p) {
  var Ce = adjust_lon_default(p.x - this.long0, this.over);
  var Cn = p.y;
  Cn = gatg_default(this.cbg, Cn);
  var sin_Cn = Math.sin(Cn);
  var cos_Cn = Math.cos(Cn);
  var sin_Ce = Math.sin(Ce);
  var cos_Ce = Math.cos(Ce);
  Cn = Math.atan2(sin_Cn, cos_Ce * cos_Cn);
  Ce = Math.atan2(sin_Ce * cos_Cn, hypot_default(sin_Cn, cos_Cn * cos_Ce));
  Ce = asinhy_default(Math.tan(Ce));
  var tmp = clens_cmplx_default(this.gtu, 2 * Cn, 2 * Ce);
  Cn = Cn + tmp[0];
  Ce = Ce + tmp[1];
  var x;
  var y;
  if (Math.abs(Ce) <= 2.623395162778) {
    x = this.a * (this.Qn * Ce) + this.x0;
    y = this.a * (this.Qn * Cn + this.Zb) + this.y0;
  } else {
    x = Infinity;
    y = Infinity;
  }
  p.x = x;
  p.y = y;
  return p;
}
function inverse4(p) {
  var Ce = (p.x - this.x0) * (1 / this.a);
  var Cn = (p.y - this.y0) * (1 / this.a);
  Cn = (Cn - this.Zb) / this.Qn;
  Ce = Ce / this.Qn;
  var lon;
  var lat;
  if (Math.abs(Ce) <= 2.623395162778) {
    var tmp = clens_cmplx_default(this.utg, 2 * Cn, 2 * Ce);
    Cn = Cn + tmp[0];
    Ce = Ce + tmp[1];
    Ce = Math.atan(sinh_default(Ce));
    var sin_Cn = Math.sin(Cn);
    var cos_Cn = Math.cos(Cn);
    var sin_Ce = Math.sin(Ce);
    var cos_Ce = Math.cos(Ce);
    Cn = Math.atan2(sin_Cn * cos_Ce, hypot_default(sin_Ce, cos_Ce * cos_Cn));
    Ce = Math.atan2(sin_Ce, cos_Ce * cos_Cn);
    lon = adjust_lon_default(Ce + this.long0, this.over);
    lat = gatg_default(this.cgb, Cn);
  } else {
    lon = Infinity;
    lat = Infinity;
  }
  p.x = lon;
  p.y = lat;
  return p;
}
var names5, etmerc_default;
var init_etmerc = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/etmerc.js"() {
    init_tmerc();
    init_sinh();
    init_hypot();
    init_asinhy();
    init_gatg();
    init_clens();
    init_clens_cmplx();
    init_adjust_lon();
    names5 = ["Extended_Transverse_Mercator", "Extended Transverse Mercator", "etmerc", "Transverse_Mercator", "Transverse Mercator", "Gauss Kruger", "Gauss_Kruger", "tmerc"];
    etmerc_default = {
      init: init4,
      forward: forward4,
      inverse: inverse4,
      names: names5
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/adjust_zone.js
function adjust_zone_default(zone, lon) {
  if (zone === void 0) {
    zone = Math.floor((adjust_lon_default(lon) + Math.PI) * 30 / Math.PI) + 1;
    if (zone < 0) {
      return 0;
    } else if (zone > 60) {
      return 60;
    }
  }
  return zone;
}
var init_adjust_zone = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/adjust_zone.js"() {
    init_adjust_lon();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/utm.js
function init5() {
  var zone = adjust_zone_default(this.zone, this.long0);
  if (zone === void 0) {
    throw new Error("unknown utm zone");
  }
  this.lat0 = 0;
  this.long0 = (6 * Math.abs(zone) - 183) * D2R;
  this.x0 = 5e5;
  this.y0 = this.utmSouth ? 1e7 : 0;
  this.k0 = 0.9996;
  etmerc_default.init.apply(this);
  this.forward = etmerc_default.forward;
  this.inverse = etmerc_default.inverse;
}
var dependsOn, names6, utm_default;
var init_utm = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/utm.js"() {
    init_adjust_zone();
    init_etmerc();
    init_values();
    dependsOn = "etmerc";
    names6 = ["Universal Transverse Mercator System", "utm"];
    utm_default = {
      init: init5,
      names: names6,
      dependsOn
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/srat.js
function srat_default(esinp, exp) {
  return Math.pow((1 - esinp) / (1 + esinp), exp);
}
var init_srat = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/srat.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/gauss.js
function init6() {
  var sphi = Math.sin(this.lat0);
  var cphi = Math.cos(this.lat0);
  cphi *= cphi;
  this.rc = Math.sqrt(1 - this.es) / (1 - this.es * sphi * sphi);
  this.C = Math.sqrt(1 + this.es * cphi * cphi / (1 - this.es));
  this.phic0 = Math.asin(sphi / this.C);
  this.ratexp = 0.5 * this.C * this.e;
  this.K = Math.tan(0.5 * this.phic0 + FORTPI) / (Math.pow(Math.tan(0.5 * this.lat0 + FORTPI), this.C) * srat_default(this.e * sphi, this.ratexp));
}
function forward5(p) {
  var lon = p.x;
  var lat = p.y;
  p.y = 2 * Math.atan(this.K * Math.pow(Math.tan(0.5 * lat + FORTPI), this.C) * srat_default(this.e * Math.sin(lat), this.ratexp)) - HALF_PI;
  p.x = this.C * lon;
  return p;
}
function inverse5(p) {
  var DEL_TOL = 1e-14;
  var lon = p.x / this.C;
  var lat = p.y;
  var num = Math.pow(Math.tan(0.5 * lat + FORTPI) / this.K, 1 / this.C);
  for (var i = MAX_ITER2; i > 0; --i) {
    lat = 2 * Math.atan(num * srat_default(this.e * Math.sin(p.y), -0.5 * this.e)) - HALF_PI;
    if (Math.abs(lat - p.y) < DEL_TOL) {
      break;
    }
    p.y = lat;
  }
  if (!i) {
    return null;
  }
  p.x = lon;
  p.y = lat;
  return p;
}
var MAX_ITER2, names7, gauss_default;
var init_gauss = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/gauss.js"() {
    init_srat();
    init_values();
    MAX_ITER2 = 20;
    names7 = ["gauss"];
    gauss_default = {
      init: init6,
      forward: forward5,
      inverse: inverse5,
      names: names7
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/sterea.js
function init7() {
  gauss_default.init.apply(this);
  if (!this.rc) {
    return;
  }
  this.sinc0 = Math.sin(this.phic0);
  this.cosc0 = Math.cos(this.phic0);
  this.R2 = 2 * this.rc;
  if (!this.title) {
    this.title = "Oblique Stereographic Alternative";
  }
}
function forward6(p) {
  var sinc, cosc, cosl, k;
  p.x = adjust_lon_default(p.x - this.long0, this.over);
  gauss_default.forward.apply(this, [p]);
  sinc = Math.sin(p.y);
  cosc = Math.cos(p.y);
  cosl = Math.cos(p.x);
  k = this.k0 * this.R2 / (1 + this.sinc0 * sinc + this.cosc0 * cosc * cosl);
  p.x = k * cosc * Math.sin(p.x);
  p.y = k * (this.cosc0 * sinc - this.sinc0 * cosc * cosl);
  p.x = this.a * p.x + this.x0;
  p.y = this.a * p.y + this.y0;
  return p;
}
function inverse6(p) {
  var sinc, cosc, lon, lat, rho;
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;
  p.x /= this.k0;
  p.y /= this.k0;
  if (rho = hypot_default(p.x, p.y)) {
    var c = 2 * Math.atan2(rho, this.R2);
    sinc = Math.sin(c);
    cosc = Math.cos(c);
    lat = Math.asin(cosc * this.sinc0 + p.y * sinc * this.cosc0 / rho);
    lon = Math.atan2(p.x * sinc, rho * this.cosc0 * cosc - p.y * this.sinc0 * sinc);
  } else {
    lat = this.phic0;
    lon = 0;
  }
  p.x = lon;
  p.y = lat;
  gauss_default.inverse.apply(this, [p]);
  p.x = adjust_lon_default(p.x + this.long0, this.over);
  return p;
}
var names8, sterea_default;
var init_sterea = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/sterea.js"() {
    init_gauss();
    init_adjust_lon();
    init_hypot();
    names8 = ["Stereographic_North_Pole", "Oblique_Stereographic", "sterea", "Oblique Stereographic Alternative", "Double_Stereographic"];
    sterea_default = {
      init: init7,
      forward: forward6,
      inverse: inverse6,
      names: names8
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/stere.js
function ssfn_(phit, sinphi, eccen) {
  sinphi *= eccen;
  return Math.tan(0.5 * (HALF_PI + phit)) * Math.pow((1 - sinphi) / (1 + sinphi), 0.5 * eccen);
}
function init8() {
  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  this.lat0 = this.lat0 || 0;
  this.long0 = this.long0 || 0;
  this.coslat0 = Math.cos(this.lat0);
  this.sinlat0 = Math.sin(this.lat0);
  if (this.sphere) {
    if (this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= EPSLN) {
      this.k0 = 0.5 * (1 + sign_default(this.lat0) * Math.sin(this.lat_ts));
    }
  } else {
    if (Math.abs(this.coslat0) <= EPSLN) {
      if (this.lat0 > 0) {
        this.con = 1;
      } else {
        this.con = -1;
      }
    }
    this.cons = Math.sqrt(Math.pow(1 + this.e, 1 + this.e) * Math.pow(1 - this.e, 1 - this.e));
    if (this.k0 === 1 && !isNaN(this.lat_ts) && Math.abs(this.coslat0) <= EPSLN && Math.abs(Math.cos(this.lat_ts)) > EPSLN) {
      this.k0 = 0.5 * this.cons * msfnz_default(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)) / tsfnz_default(this.e, this.con * this.lat_ts, this.con * Math.sin(this.lat_ts));
    }
    this.ms1 = msfnz_default(this.e, this.sinlat0, this.coslat0);
    this.X0 = 2 * Math.atan(ssfn_(this.lat0, this.sinlat0, this.e)) - HALF_PI;
    this.cosX0 = Math.cos(this.X0);
    this.sinX0 = Math.sin(this.X0);
  }
}
function forward7(p) {
  var lon = p.x;
  var lat = p.y;
  var sinlat = Math.sin(lat);
  var coslat = Math.cos(lat);
  var A5, X9, sinX, cosX, ts, rh;
  var dlon = adjust_lon_default(lon - this.long0, this.over);
  if (Math.abs(Math.abs(lon - this.long0) - Math.PI) <= EPSLN && Math.abs(lat + this.lat0) <= EPSLN) {
    p.x = NaN;
    p.y = NaN;
    return p;
  }
  if (this.sphere) {
    A5 = 2 * this.k0 / (1 + this.sinlat0 * sinlat + this.coslat0 * coslat * Math.cos(dlon));
    p.x = this.a * A5 * coslat * Math.sin(dlon) + this.x0;
    p.y = this.a * A5 * (this.coslat0 * sinlat - this.sinlat0 * coslat * Math.cos(dlon)) + this.y0;
    return p;
  } else {
    X9 = 2 * Math.atan(ssfn_(lat, sinlat, this.e)) - HALF_PI;
    cosX = Math.cos(X9);
    sinX = Math.sin(X9);
    if (Math.abs(this.coslat0) <= EPSLN) {
      ts = tsfnz_default(this.e, lat * this.con, this.con * sinlat);
      rh = 2 * this.a * this.k0 * ts / this.cons;
      p.x = this.x0 + rh * Math.sin(lon - this.long0);
      p.y = this.y0 - this.con * rh * Math.cos(lon - this.long0);
      return p;
    } else if (Math.abs(this.sinlat0) < EPSLN) {
      A5 = 2 * this.a * this.k0 / (1 + cosX * Math.cos(dlon));
      p.y = A5 * sinX;
    } else {
      A5 = 2 * this.a * this.k0 * this.ms1 / (this.cosX0 * (1 + this.sinX0 * sinX + this.cosX0 * cosX * Math.cos(dlon)));
      p.y = A5 * (this.cosX0 * sinX - this.sinX0 * cosX * Math.cos(dlon)) + this.y0;
    }
    p.x = A5 * cosX * Math.sin(dlon) + this.x0;
  }
  return p;
}
function inverse7(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var lon, lat, ts, ce, Chi;
  var rh = Math.sqrt(p.x * p.x + p.y * p.y);
  if (this.sphere) {
    var c = 2 * Math.atan(rh / (2 * this.a * this.k0));
    lon = this.long0;
    lat = this.lat0;
    if (rh <= EPSLN) {
      p.x = lon;
      p.y = lat;
      return p;
    }
    lat = Math.asin(Math.cos(c) * this.sinlat0 + p.y * Math.sin(c) * this.coslat0 / rh);
    if (Math.abs(this.coslat0) < EPSLN) {
      if (this.lat0 > 0) {
        lon = adjust_lon_default(this.long0 + Math.atan2(p.x, -1 * p.y), this.over);
      } else {
        lon = adjust_lon_default(this.long0 + Math.atan2(p.x, p.y), this.over);
      }
    } else {
      lon = adjust_lon_default(this.long0 + Math.atan2(p.x * Math.sin(c), rh * this.coslat0 * Math.cos(c) - p.y * this.sinlat0 * Math.sin(c)), this.over);
    }
    p.x = lon;
    p.y = lat;
    return p;
  } else {
    if (Math.abs(this.coslat0) <= EPSLN) {
      if (rh <= EPSLN) {
        lat = this.lat0;
        lon = this.long0;
        p.x = lon;
        p.y = lat;
        return p;
      }
      p.x *= this.con;
      p.y *= this.con;
      ts = rh * this.cons / (2 * this.a * this.k0);
      lat = this.con * phi2z_default(this.e, ts);
      lon = this.con * adjust_lon_default(this.con * this.long0 + Math.atan2(p.x, -1 * p.y), this.over);
    } else {
      ce = 2 * Math.atan(rh * this.cosX0 / (2 * this.a * this.k0 * this.ms1));
      lon = this.long0;
      if (rh <= EPSLN) {
        Chi = this.X0;
      } else {
        Chi = Math.asin(Math.cos(ce) * this.sinX0 + p.y * Math.sin(ce) * this.cosX0 / rh);
        lon = adjust_lon_default(this.long0 + Math.atan2(p.x * Math.sin(ce), rh * this.cosX0 * Math.cos(ce) - p.y * this.sinX0 * Math.sin(ce)), this.over);
      }
      lat = -1 * phi2z_default(this.e, Math.tan(0.5 * (HALF_PI + Chi)));
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
}
var names9, stere_default;
var init_stere = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/stere.js"() {
    init_values();
    init_sign();
    init_msfnz();
    init_tsfnz();
    init_phi2z();
    init_adjust_lon();
    names9 = ["stere", "Stereographic_South_Pole", "Polar_Stereographic_variant_A", "Polar_Stereographic_variant_B", "Polar_Stereographic"];
    stere_default = {
      init: init8,
      forward: forward7,
      inverse: inverse7,
      names: names9,
      ssfn_
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/somerc.js
function init9() {
  var phy0 = this.lat0;
  this.lambda0 = this.long0;
  var sinPhy0 = Math.sin(phy0);
  var semiMajorAxis = this.a;
  var invF = this.rf;
  var flattening = 1 / invF;
  var e2 = 2 * flattening - Math.pow(flattening, 2);
  var e = this.e = Math.sqrt(e2);
  this.R = this.k0 * semiMajorAxis * Math.sqrt(1 - e2) / (1 - e2 * Math.pow(sinPhy0, 2));
  this.alpha = Math.sqrt(1 + e2 / (1 - e2) * Math.pow(Math.cos(phy0), 4));
  this.b0 = Math.asin(sinPhy0 / this.alpha);
  var k1 = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2));
  var k2 = Math.log(Math.tan(Math.PI / 4 + phy0 / 2));
  var k3 = Math.log((1 + e * sinPhy0) / (1 - e * sinPhy0));
  this.K = k1 - this.alpha * k2 + this.alpha * e / 2 * k3;
}
function forward8(p) {
  var Sa1 = Math.log(Math.tan(Math.PI / 4 - p.y / 2));
  var Sa2 = this.e / 2 * Math.log((1 + this.e * Math.sin(p.y)) / (1 - this.e * Math.sin(p.y)));
  var S = -this.alpha * (Sa1 + Sa2) + this.K;
  var b = 2 * (Math.atan(Math.exp(S)) - Math.PI / 4);
  var I2 = this.alpha * (p.x - this.lambda0);
  var rotI = Math.atan(Math.sin(I2) / (Math.sin(this.b0) * Math.tan(b) + Math.cos(this.b0) * Math.cos(I2)));
  var rotB = Math.asin(Math.cos(this.b0) * Math.sin(b) - Math.sin(this.b0) * Math.cos(b) * Math.cos(I2));
  p.y = this.R / 2 * Math.log((1 + Math.sin(rotB)) / (1 - Math.sin(rotB))) + this.y0;
  p.x = this.R * rotI + this.x0;
  return p;
}
function inverse8(p) {
  var Y = p.x - this.x0;
  var X9 = p.y - this.y0;
  var rotI = Y / this.R;
  var rotB = 2 * (Math.atan(Math.exp(X9 / this.R)) - Math.PI / 4);
  var b = Math.asin(Math.cos(this.b0) * Math.sin(rotB) + Math.sin(this.b0) * Math.cos(rotB) * Math.cos(rotI));
  var I2 = Math.atan(Math.sin(rotI) / (Math.cos(this.b0) * Math.cos(rotI) - Math.sin(this.b0) * Math.tan(rotB)));
  var lambda = this.lambda0 + I2 / this.alpha;
  var S = 0;
  var phy = b;
  var prevPhy = -1e3;
  var iteration = 0;
  while (Math.abs(phy - prevPhy) > 1e-7) {
    if (++iteration > 20) {
      return;
    }
    S = 1 / this.alpha * (Math.log(Math.tan(Math.PI / 4 + b / 2)) - this.K) + this.e * Math.log(Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(phy)) / 2));
    prevPhy = phy;
    phy = 2 * Math.atan(Math.exp(S)) - Math.PI / 2;
  }
  p.x = lambda;
  p.y = phy;
  return p;
}
var names10, somerc_default;
var init_somerc = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/somerc.js"() {
    names10 = ["somerc"];
    somerc_default = {
      init: init9,
      forward: forward8,
      inverse: inverse8,
      names: names10
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/omerc.js
function isTypeA(P) {
  var typeAProjections = ["Hotine_Oblique_Mercator", "Hotine_Oblique_Mercator_variant_A", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin"];
  var projectionName = typeof P.projName === "object" ? Object.keys(P.projName)[0] : P.projName;
  return "no_uoff" in P || "no_off" in P || typeAProjections.indexOf(projectionName) !== -1 || typeAProjections.indexOf(getNormalizedProjName(projectionName)) !== -1;
}
function init10() {
  var con, com, cosph0, D, F, H, L, sinph0, p, J, gamma = 0, gamma0, lamc = 0, lam1 = 0, lam2 = 0, phi1 = 0, phi2 = 0, alpha_c = 0;
  this.no_off = isTypeA(this);
  this.no_rot = "no_rot" in this;
  var alp = false;
  if ("alpha" in this) {
    alp = true;
  }
  var gam = false;
  if ("rectified_grid_angle" in this) {
    gam = true;
  }
  if (alp) {
    alpha_c = this.alpha;
  }
  if (gam) {
    gamma = this.rectified_grid_angle;
    if (!alp) {
      alpha_c = 0;
      alp = true;
    }
  }
  if (alp || gam) {
    lamc = this.longc;
  } else {
    lam1 = this.long1;
    phi1 = this.lat1;
    lam2 = this.long2;
    phi2 = this.lat2;
    if (Math.abs(phi1 - phi2) <= TOL || (con = Math.abs(phi1)) <= TOL || Math.abs(con - HALF_PI) <= TOL || Math.abs(Math.abs(this.lat0) - HALF_PI) <= TOL || Math.abs(Math.abs(phi2) - HALF_PI) <= TOL) {
      throw new Error();
    }
  }
  var one_es = 1 - this.es;
  com = Math.sqrt(one_es);
  if (Math.abs(this.lat0) > EPSLN) {
    sinph0 = Math.sin(this.lat0);
    cosph0 = Math.cos(this.lat0);
    con = 1 - this.es * sinph0 * sinph0;
    this.B = cosph0 * cosph0;
    this.B = Math.sqrt(1 + this.es * this.B * this.B / one_es);
    this.A = this.B * this.k0 * com / con;
    D = this.B * com / (cosph0 * Math.sqrt(con));
    F = D * D - 1;
    if (F <= 0) {
      F = 0;
    } else {
      F = Math.sqrt(F);
      if (this.lat0 < 0) {
        F = -F;
      }
    }
    this.E = F += D;
    this.E *= Math.pow(tsfnz_default(this.e, this.lat0, sinph0), this.B);
  } else {
    this.B = 1 / com;
    this.A = this.k0;
    this.E = D = F = 1;
  }
  if (alp || gam) {
    if (alp) {
      gamma0 = Math.asin(Math.sin(alpha_c) / D);
      if (!gam) {
        gamma = alpha_c;
      }
    } else {
      gamma0 = gamma;
      alpha_c = Math.asin(D * Math.sin(gamma0));
    }
    this.lam0 = lamc - Math.asin(0.5 * (F - 1 / F) * Math.tan(gamma0)) / this.B;
  } else {
    H = Math.pow(tsfnz_default(this.e, phi1, Math.sin(phi1)), this.B);
    L = Math.pow(tsfnz_default(this.e, phi2, Math.sin(phi2)), this.B);
    F = this.E / H;
    p = (L - H) / (L + H);
    J = this.E * this.E;
    J = (J - L * H) / (J + L * H);
    con = lam1 - lam2;
    if (con < -Math.PI) {
      lam2 -= TWO_PI;
    } else if (con > Math.PI) {
      lam2 += TWO_PI;
    }
    this.lam0 = adjust_lon_default(0.5 * (lam1 + lam2) - Math.atan(J * Math.tan(0.5 * this.B * (lam1 - lam2)) / p) / this.B, this.over);
    gamma0 = Math.atan(2 * Math.sin(this.B * adjust_lon_default(lam1 - this.lam0, this.over)) / (F - 1 / F));
    gamma = alpha_c = Math.asin(D * Math.sin(gamma0));
  }
  this.singam = Math.sin(gamma0);
  this.cosgam = Math.cos(gamma0);
  this.sinrot = Math.sin(gamma);
  this.cosrot = Math.cos(gamma);
  this.rB = 1 / this.B;
  this.ArB = this.A * this.rB;
  this.BrA = 1 / this.ArB;
  if (this.no_off) {
    this.u_0 = 0;
  } else {
    this.u_0 = Math.abs(this.ArB * Math.atan(Math.sqrt(D * D - 1) / Math.cos(alpha_c)));
    if (this.lat0 < 0) {
      this.u_0 = -this.u_0;
    }
  }
  F = 0.5 * gamma0;
  this.v_pole_n = this.ArB * Math.log(Math.tan(FORTPI - F));
  this.v_pole_s = this.ArB * Math.log(Math.tan(FORTPI + F));
}
function forward9(p) {
  var coords = {};
  var S, T, U, V2, W, temp, u, v;
  p.x = p.x - this.lam0;
  if (Math.abs(Math.abs(p.y) - HALF_PI) > EPSLN) {
    W = this.E / Math.pow(tsfnz_default(this.e, p.y, Math.sin(p.y)), this.B);
    temp = 1 / W;
    S = 0.5 * (W - temp);
    T = 0.5 * (W + temp);
    V2 = Math.sin(this.B * p.x);
    U = (S * this.singam - V2 * this.cosgam) / T;
    if (Math.abs(Math.abs(U) - 1) < EPSLN) {
      throw new Error();
    }
    v = 0.5 * this.ArB * Math.log((1 - U) / (1 + U));
    temp = Math.cos(this.B * p.x);
    if (Math.abs(temp) < TOL) {
      u = this.A * p.x;
    } else {
      u = this.ArB * Math.atan2(S * this.cosgam + V2 * this.singam, temp);
    }
  } else {
    v = p.y > 0 ? this.v_pole_n : this.v_pole_s;
    u = this.ArB * p.y;
  }
  if (this.no_rot) {
    coords.x = u;
    coords.y = v;
  } else {
    u -= this.u_0;
    coords.x = v * this.cosrot + u * this.sinrot;
    coords.y = u * this.cosrot - v * this.sinrot;
  }
  coords.x = this.a * coords.x + this.x0;
  coords.y = this.a * coords.y + this.y0;
  return coords;
}
function inverse9(p) {
  var u, v, Qp, Sp, Tp, Vp, Up;
  var coords = {};
  p.x = (p.x - this.x0) * (1 / this.a);
  p.y = (p.y - this.y0) * (1 / this.a);
  if (this.no_rot) {
    v = p.y;
    u = p.x;
  } else {
    v = p.x * this.cosrot - p.y * this.sinrot;
    u = p.y * this.cosrot + p.x * this.sinrot + this.u_0;
  }
  Qp = Math.exp(-this.BrA * v);
  Sp = 0.5 * (Qp - 1 / Qp);
  Tp = 0.5 * (Qp + 1 / Qp);
  Vp = Math.sin(this.BrA * u);
  Up = (Vp * this.cosgam + Sp * this.singam) / Tp;
  if (Math.abs(Math.abs(Up) - 1) < EPSLN) {
    coords.x = 0;
    coords.y = Up < 0 ? -HALF_PI : HALF_PI;
  } else {
    coords.y = this.E / Math.sqrt((1 + Up) / (1 - Up));
    coords.y = phi2z_default(this.e, Math.pow(coords.y, 1 / this.B));
    if (coords.y === Infinity) {
      throw new Error();
    }
    coords.x = -this.rB * Math.atan2(Sp * this.cosgam - Vp * this.singam, Math.cos(this.BrA * u));
  }
  coords.x += this.lam0;
  return coords;
}
var TOL, names11, omerc_default;
var init_omerc = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/omerc.js"() {
    init_tsfnz();
    init_adjust_lon();
    init_phi2z();
    init_values();
    init_projections();
    TOL = 1e-7;
    names11 = ["Hotine_Oblique_Mercator", "Hotine Oblique Mercator", "Hotine_Oblique_Mercator_variant_A", "Hotine_Oblique_Mercator_Variant_B", "Hotine_Oblique_Mercator_Azimuth_Natural_Origin", "Hotine_Oblique_Mercator_Two_Point_Natural_Origin", "Hotine_Oblique_Mercator_Azimuth_Center", "Oblique_Mercator", "omerc"];
    omerc_default = {
      init: init10,
      forward: forward9,
      inverse: inverse9,
      names: names11
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/lcc.js
function init11() {
  if (!this.lat2) {
    this.lat2 = this.lat1;
  }
  if (!this.k0) {
    this.k0 = 1;
  }
  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }
  var temp = this.b / this.a;
  this.e = Math.sqrt(1 - temp * temp);
  var sin1 = Math.sin(this.lat1);
  var cos1 = Math.cos(this.lat1);
  var ms1 = msfnz_default(this.e, sin1, cos1);
  var ts1 = tsfnz_default(this.e, this.lat1, sin1);
  var sin2 = Math.sin(this.lat2);
  var cos2 = Math.cos(this.lat2);
  var ms2 = msfnz_default(this.e, sin2, cos2);
  var ts2 = tsfnz_default(this.e, this.lat2, sin2);
  var ts0 = Math.abs(Math.abs(this.lat0) - HALF_PI) < EPSLN ? 0 : tsfnz_default(this.e, this.lat0, Math.sin(this.lat0));
  if (Math.abs(this.lat1 - this.lat2) > EPSLN) {
    this.ns = Math.log(ms1 / ms2) / Math.log(ts1 / ts2);
  } else {
    this.ns = sin1;
  }
  if (isNaN(this.ns)) {
    this.ns = sin1;
  }
  this.f0 = ms1 / (this.ns * Math.pow(ts1, this.ns));
  this.rh = this.a * this.f0 * Math.pow(ts0, this.ns);
  if (!this.title) {
    this.title = "Lambert Conformal Conic";
  }
}
function forward10(p) {
  var lon = p.x;
  var lat = p.y;
  if (Math.abs(2 * Math.abs(lat) - Math.PI) <= EPSLN) {
    lat = sign_default(lat) * (HALF_PI - 2 * EPSLN);
  }
  var con = Math.abs(Math.abs(lat) - HALF_PI);
  var ts, rh1;
  if (con > EPSLN) {
    ts = tsfnz_default(this.e, lat, Math.sin(lat));
    rh1 = this.a * this.f0 * Math.pow(ts, this.ns);
  } else {
    con = lat * this.ns;
    if (con <= 0) {
      return null;
    }
    rh1 = 0;
  }
  var theta = this.ns * adjust_lon_default(lon - this.long0, this.over);
  p.x = this.k0 * (rh1 * Math.sin(theta)) + this.x0;
  p.y = this.k0 * (this.rh - rh1 * Math.cos(theta)) + this.y0;
  return p;
}
function inverse10(p) {
  var rh1, con, ts;
  var lat, lon;
  var x = (p.x - this.x0) / this.k0;
  var y = this.rh - (p.y - this.y0) / this.k0;
  if (this.ns > 0) {
    rh1 = Math.sqrt(x * x + y * y);
    con = 1;
  } else {
    rh1 = -Math.sqrt(x * x + y * y);
    con = -1;
  }
  var theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2(con * x, con * y);
  }
  if (rh1 !== 0 || this.ns > 0) {
    con = 1 / this.ns;
    ts = Math.pow(rh1 / (this.a * this.f0), con);
    lat = phi2z_default(this.e, ts);
    if (lat === -9999) {
      return null;
    }
  } else {
    lat = -HALF_PI;
  }
  lon = adjust_lon_default(theta / this.ns + this.long0, this.over);
  p.x = lon;
  p.y = lat;
  return p;
}
var names12, lcc_default;
var init_lcc = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/lcc.js"() {
    init_msfnz();
    init_tsfnz();
    init_sign();
    init_adjust_lon();
    init_phi2z();
    init_values();
    names12 = [
      "Lambert Tangential Conformal Conic Projection",
      "Lambert_Conformal_Conic",
      "Lambert_Conformal_Conic_1SP",
      "Lambert_Conformal_Conic_2SP",
      "lcc",
      "Lambert Conic Conformal (1SP)",
      "Lambert Conic Conformal (2SP)"
    ];
    lcc_default = {
      init: init11,
      forward: forward10,
      inverse: inverse10,
      names: names12
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/krovak.js
function init12() {
  this.a = 6377397155e-3;
  this.es = 0.006674372230614;
  this.e = Math.sqrt(this.es);
  if (!this.lat0) {
    this.lat0 = 0.863937979737193;
  }
  if (!this.long0) {
    this.long0 = 0.7417649320975901 - 0.308341501185665;
  }
  if (!this.k0) {
    this.k0 = 0.9999;
  }
  this.s45 = 0.785398163397448;
  this.s90 = 2 * this.s45;
  this.fi0 = this.lat0;
  this.e2 = this.es;
  this.e = Math.sqrt(this.e2);
  this.alfa = Math.sqrt(1 + this.e2 * Math.pow(Math.cos(this.fi0), 4) / (1 - this.e2));
  this.uq = 1.04216856380474;
  this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa);
  this.g = Math.pow((1 + this.e * Math.sin(this.fi0)) / (1 - this.e * Math.sin(this.fi0)), this.alfa * this.e / 2);
  this.k = Math.tan(this.u0 / 2 + this.s45) / Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa) * this.g;
  this.k1 = this.k0;
  this.n0 = this.a * Math.sqrt(1 - this.e2) / (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2));
  this.s0 = 1.37008346281555;
  this.n = Math.sin(this.s0);
  this.ro0 = this.k1 * this.n0 / Math.tan(this.s0);
  this.ad = this.s90 - this.uq;
}
function forward11(p) {
  var gfi, u, deltav, s, d, eps, ro;
  var lon = p.x;
  var lat = p.y;
  var delta_lon = adjust_lon_default(lon - this.long0, this.over);
  gfi = Math.pow((1 + this.e * Math.sin(lat)) / (1 - this.e * Math.sin(lat)), this.alfa * this.e / 2);
  u = 2 * (Math.atan(this.k * Math.pow(Math.tan(lat / 2 + this.s45), this.alfa) / gfi) - this.s45);
  deltav = -delta_lon * this.alfa;
  s = Math.asin(Math.cos(this.ad) * Math.sin(u) + Math.sin(this.ad) * Math.cos(u) * Math.cos(deltav));
  d = Math.asin(Math.cos(u) * Math.sin(deltav) / Math.cos(s));
  eps = this.n * d;
  ro = this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n) / Math.pow(Math.tan(s / 2 + this.s45), this.n);
  p.y = ro * Math.cos(eps) / 1;
  p.x = ro * Math.sin(eps) / 1;
  if (!this.czech) {
    p.y *= -1;
    p.x *= -1;
  }
  return p;
}
function inverse11(p) {
  var u, deltav, s, d, eps, ro, fi1;
  var ok;
  var tmp = p.x;
  p.x = p.y;
  p.y = tmp;
  if (!this.czech) {
    p.y *= -1;
    p.x *= -1;
  }
  ro = Math.sqrt(p.x * p.x + p.y * p.y);
  eps = Math.atan2(p.y, p.x);
  d = eps / Math.sin(this.s0);
  s = 2 * (Math.atan(Math.pow(this.ro0 / ro, 1 / this.n) * Math.tan(this.s0 / 2 + this.s45)) - this.s45);
  u = Math.asin(Math.cos(this.ad) * Math.sin(s) - Math.sin(this.ad) * Math.cos(s) * Math.cos(d));
  deltav = Math.asin(Math.cos(s) * Math.sin(d) / Math.cos(u));
  p.x = this.long0 - deltav / this.alfa;
  fi1 = u;
  ok = 0;
  var iter = 0;
  do {
    p.y = 2 * (Math.atan(Math.pow(this.k, -1 / this.alfa) * Math.pow(Math.tan(u / 2 + this.s45), 1 / this.alfa) * Math.pow((1 + this.e * Math.sin(fi1)) / (1 - this.e * Math.sin(fi1)), this.e / 2)) - this.s45);
    if (Math.abs(fi1 - p.y) < 1e-10) {
      ok = 1;
    }
    fi1 = p.y;
    iter += 1;
  } while (ok === 0 && iter < 15);
  if (iter >= 15) {
    return null;
  }
  return p;
}
var names13, krovak_default;
var init_krovak = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/krovak.js"() {
    init_adjust_lon();
    names13 = ["Krovak", "Krovak Modified", "Krovak (North Orientated)", "Krovak Modified (North Orientated)", "krovak"];
    krovak_default = {
      init: init12,
      forward: forward11,
      inverse: inverse11,
      names: names13
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/mlfn.js
function mlfn_default(e0, e1, e2, e3, phi) {
  return e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi);
}
var init_mlfn = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/mlfn.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/e0fn.js
function e0fn_default(x) {
  return 1 - 0.25 * x * (1 + x / 16 * (3 + 1.25 * x));
}
var init_e0fn = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/e0fn.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/e1fn.js
function e1fn_default(x) {
  return 0.375 * x * (1 + 0.25 * x * (1 + 0.46875 * x));
}
var init_e1fn = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/e1fn.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/e2fn.js
function e2fn_default(x) {
  return 0.05859375 * x * x * (1 + 0.75 * x);
}
var init_e2fn = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/e2fn.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/e3fn.js
function e3fn_default(x) {
  return x * x * x * (35 / 3072);
}
var init_e3fn = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/e3fn.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/gN.js
function gN_default(a, e, sinphi) {
  var temp = e * sinphi;
  return a / Math.sqrt(1 - temp * temp);
}
var init_gN = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/gN.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/adjust_lat.js
function adjust_lat_default(x) {
  return Math.abs(x) < HALF_PI ? x : x - sign_default(x) * Math.PI;
}
var init_adjust_lat = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/adjust_lat.js"() {
    init_values();
    init_sign();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/imlfn.js
function imlfn_default(ml, e0, e1, e2, e3) {
  var phi;
  var dphi;
  phi = ml / e0;
  for (var i = 0; i < 15; i++) {
    dphi = (ml - (e0 * phi - e1 * Math.sin(2 * phi) + e2 * Math.sin(4 * phi) - e3 * Math.sin(6 * phi))) / (e0 - 2 * e1 * Math.cos(2 * phi) + 4 * e2 * Math.cos(4 * phi) - 6 * e3 * Math.cos(6 * phi));
    phi += dphi;
    if (Math.abs(dphi) <= 1e-10) {
      return phi;
    }
  }
  return NaN;
}
var init_imlfn = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/imlfn.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/cass.js
function init13() {
  if (!this.sphere) {
    this.e0 = e0fn_default(this.es);
    this.e1 = e1fn_default(this.es);
    this.e2 = e2fn_default(this.es);
    this.e3 = e3fn_default(this.es);
    this.ml0 = this.a * mlfn_default(this.e0, this.e1, this.e2, this.e3, this.lat0);
  }
}
function forward12(p) {
  var x, y;
  var lam = p.x;
  var phi = p.y;
  lam = adjust_lon_default(lam - this.long0, this.over);
  if (this.sphere) {
    x = this.a * Math.asin(Math.cos(phi) * Math.sin(lam));
    y = this.a * (Math.atan2(Math.tan(phi), Math.cos(lam)) - this.lat0);
  } else {
    var sinphi = Math.sin(phi);
    var cosphi = Math.cos(phi);
    var nl = gN_default(this.a, this.e, sinphi);
    var tl = Math.tan(phi) * Math.tan(phi);
    var al = lam * Math.cos(phi);
    var asq = al * al;
    var cl = this.es * cosphi * cosphi / (1 - this.es);
    var ml = this.a * mlfn_default(this.e0, this.e1, this.e2, this.e3, phi);
    x = nl * al * (1 - asq * tl * (1 / 6 - (8 - tl + 8 * cl) * asq / 120));
    y = ml - this.ml0 + nl * sinphi / cosphi * asq * (0.5 + (5 - tl + 6 * cl) * asq / 24);
  }
  p.x = x + this.x0;
  p.y = y + this.y0;
  return p;
}
function inverse12(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var x = p.x / this.a;
  var y = p.y / this.a;
  var phi, lam;
  if (this.sphere) {
    var dd = y + this.lat0;
    phi = Math.asin(Math.sin(dd) * Math.cos(x));
    lam = Math.atan2(Math.tan(x), Math.cos(dd));
  } else {
    var ml1 = this.ml0 / this.a + y;
    var phi1 = imlfn_default(ml1, this.e0, this.e1, this.e2, this.e3);
    if (Math.abs(Math.abs(phi1) - HALF_PI) <= EPSLN) {
      p.x = this.long0;
      p.y = HALF_PI;
      if (y < 0) {
        p.y *= -1;
      }
      return p;
    }
    var nl1 = gN_default(this.a, this.e, Math.sin(phi1));
    var rl1 = nl1 * nl1 * nl1 / this.a / this.a * (1 - this.es);
    var tl1 = Math.pow(Math.tan(phi1), 2);
    var dl = x * this.a / nl1;
    var dsq = dl * dl;
    phi = phi1 - nl1 * Math.tan(phi1) / rl1 * dl * dl * (0.5 - (1 + 3 * tl1) * dl * dl / 24);
    lam = dl * (1 - dsq * (tl1 / 3 + (1 + 3 * tl1) * tl1 * dsq / 15)) / Math.cos(phi1);
  }
  p.x = adjust_lon_default(lam + this.long0, this.over);
  p.y = adjust_lat_default(phi);
  return p;
}
var names14, cass_default;
var init_cass = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/cass.js"() {
    init_mlfn();
    init_e0fn();
    init_e1fn();
    init_e2fn();
    init_e3fn();
    init_gN();
    init_adjust_lon();
    init_adjust_lat();
    init_imlfn();
    init_values();
    names14 = ["Cassini", "Cassini_Soldner", "cass"];
    cass_default = {
      init: init13,
      forward: forward12,
      inverse: inverse12,
      names: names14
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/qsfnz.js
function qsfnz_default(eccent, sinphi) {
  var con;
  if (eccent > 1e-7) {
    con = eccent * sinphi;
    return (1 - eccent * eccent) * (sinphi / (1 - con * con) - 0.5 / eccent * Math.log((1 - con) / (1 + con)));
  } else {
    return 2 * sinphi;
  }
}
var init_qsfnz = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/qsfnz.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/authset.js
function authset(es) {
  var t;
  var APA = [];
  APA[0] = es * P00;
  t = es * es;
  APA[0] += t * P01;
  APA[1] = t * P10;
  t *= es;
  APA[0] += t * P02;
  APA[1] += t * P11;
  APA[2] = t * P20;
  return APA;
}
var P00, P01, P02, P10, P11, P20;
var init_authset = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/authset.js"() {
    P00 = 0.3333333333333333;
    P01 = 0.17222222222222222;
    P02 = 0.10257936507936508;
    P10 = 0.06388888888888888;
    P11 = 0.0664021164021164;
    P20 = 0.016415012942191543;
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/authlat.js
function authlat(beta, APA) {
  var t = beta + beta;
  return beta + APA[0] * Math.sin(t) + APA[1] * Math.sin(t + t) + APA[2] * Math.sin(t + t + t);
}
var init_authlat = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/authlat.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/laea.js
function init14() {
  var t = Math.abs(this.lat0);
  if (Math.abs(t - HALF_PI) < EPSLN) {
    this.mode = this.lat0 < 0 ? S_POLE : N_POLE;
  } else if (Math.abs(t) < EPSLN) {
    this.mode = EQUIT;
  } else {
    this.mode = OBLIQ;
  }
  if (this.es > 0) {
    var sinphi;
    this.qp = qsfnz_default(this.e, 1);
    this.mmf = 0.5 / (1 - this.es);
    this.apa = authset(this.es);
    switch (this.mode) {
      case N_POLE:
        this.dd = 1;
        break;
      case S_POLE:
        this.dd = 1;
        break;
      case EQUIT:
        this.rq = Math.sqrt(0.5 * this.qp);
        this.dd = 1 / this.rq;
        this.xmf = 1;
        this.ymf = 0.5 * this.qp;
        break;
      case OBLIQ:
        this.rq = Math.sqrt(0.5 * this.qp);
        sinphi = Math.sin(this.lat0);
        this.sinb1 = qsfnz_default(this.e, sinphi) / this.qp;
        this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1);
        this.dd = Math.cos(this.lat0) / (Math.sqrt(1 - this.es * sinphi * sinphi) * this.rq * this.cosb1);
        this.ymf = (this.xmf = this.rq) / this.dd;
        this.xmf *= this.dd;
        break;
    }
  } else {
    if (this.mode === OBLIQ) {
      this.sinph0 = Math.sin(this.lat0);
      this.cosph0 = Math.cos(this.lat0);
    }
  }
}
function forward13(p) {
  var x, y, coslam, sinlam, sinphi, q, sinb, cosb, b, cosphi;
  var lam = p.x;
  var phi = p.y;
  lam = adjust_lon_default(lam - this.long0, this.over);
  if (this.sphere) {
    sinphi = Math.sin(phi);
    cosphi = Math.cos(phi);
    coslam = Math.cos(lam);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      y = this.mode === this.EQUIT ? 1 + cosphi * coslam : 1 + this.sinph0 * sinphi + this.cosph0 * cosphi * coslam;
      if (y <= EPSLN) {
        return null;
      }
      y = Math.sqrt(2 / y);
      x = y * cosphi * Math.sin(lam);
      y *= this.mode === this.EQUIT ? sinphi : this.cosph0 * sinphi - this.sinph0 * cosphi * coslam;
    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE) {
        coslam = -coslam;
      }
      if (Math.abs(phi + this.lat0) < EPSLN) {
        return null;
      }
      y = FORTPI - phi * 0.5;
      y = 2 * (this.mode === this.S_POLE ? Math.cos(y) : Math.sin(y));
      x = y * Math.sin(lam);
      y *= coslam;
    }
  } else {
    sinb = 0;
    cosb = 0;
    b = 0;
    coslam = Math.cos(lam);
    sinlam = Math.sin(lam);
    sinphi = Math.sin(phi);
    q = qsfnz_default(this.e, sinphi);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      sinb = q / this.qp;
      cosb = Math.sqrt(1 - sinb * sinb);
    }
    switch (this.mode) {
      case this.OBLIQ:
        b = 1 + this.sinb1 * sinb + this.cosb1 * cosb * coslam;
        break;
      case this.EQUIT:
        b = 1 + cosb * coslam;
        break;
      case this.N_POLE:
        b = HALF_PI + phi;
        q = this.qp - q;
        break;
      case this.S_POLE:
        b = phi - HALF_PI;
        q = this.qp + q;
        break;
    }
    if (Math.abs(b) < EPSLN) {
      return null;
    }
    switch (this.mode) {
      case this.OBLIQ:
      case this.EQUIT:
        b = Math.sqrt(2 / b);
        if (this.mode === this.OBLIQ) {
          y = this.ymf * b * (this.cosb1 * sinb - this.sinb1 * cosb * coslam);
        } else {
          y = (b = Math.sqrt(2 / (1 + cosb * coslam))) * sinb * this.ymf;
        }
        x = this.xmf * b * cosb * sinlam;
        break;
      case this.N_POLE:
      case this.S_POLE:
        if (q >= 0) {
          x = (b = Math.sqrt(q)) * sinlam;
          y = coslam * (this.mode === this.S_POLE ? b : -b);
        } else {
          x = y = 0;
        }
        break;
    }
  }
  p.x = this.a * x + this.x0;
  p.y = this.a * y + this.y0;
  return p;
}
function inverse13(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var x = p.x / this.a;
  var y = p.y / this.a;
  var lam, phi, cCe, sCe, q, rho, ab;
  if (this.sphere) {
    var cosz = 0, rh, sinz = 0;
    rh = Math.sqrt(x * x + y * y);
    phi = rh * 0.5;
    if (phi > 1) {
      return null;
    }
    phi = 2 * Math.asin(phi);
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      sinz = Math.sin(phi);
      cosz = Math.cos(phi);
    }
    switch (this.mode) {
      case this.EQUIT:
        phi = Math.abs(rh) <= EPSLN ? 0 : Math.asin(y * sinz / rh);
        x *= sinz;
        y = cosz * rh;
        break;
      case this.OBLIQ:
        phi = Math.abs(rh) <= EPSLN ? this.lat0 : Math.asin(cosz * this.sinph0 + y * sinz * this.cosph0 / rh);
        x *= sinz * this.cosph0;
        y = (cosz - Math.sin(phi) * this.sinph0) * rh;
        break;
      case this.N_POLE:
        y = -y;
        phi = HALF_PI - phi;
        break;
      case this.S_POLE:
        phi -= HALF_PI;
        break;
    }
    lam = y === 0 && (this.mode === this.EQUIT || this.mode === this.OBLIQ) ? 0 : Math.atan2(x, y);
  } else {
    ab = 0;
    if (this.mode === this.OBLIQ || this.mode === this.EQUIT) {
      x /= this.dd;
      y *= this.dd;
      rho = Math.sqrt(x * x + y * y);
      if (rho < EPSLN) {
        p.x = this.long0;
        p.y = this.lat0;
        return p;
      }
      sCe = 2 * Math.asin(0.5 * rho / this.rq);
      cCe = Math.cos(sCe);
      x *= sCe = Math.sin(sCe);
      if (this.mode === this.OBLIQ) {
        ab = cCe * this.sinb1 + y * sCe * this.cosb1 / rho;
        q = this.qp * ab;
        y = rho * this.cosb1 * cCe - y * this.sinb1 * sCe;
      } else {
        ab = y * sCe / rho;
        q = this.qp * ab;
        y = rho * cCe;
      }
    } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
      if (this.mode === this.N_POLE) {
        y = -y;
      }
      q = x * x + y * y;
      if (!q) {
        p.x = this.long0;
        p.y = this.lat0;
        return p;
      }
      ab = 1 - q / this.qp;
      if (this.mode === this.S_POLE) {
        ab = -ab;
      }
    }
    lam = Math.atan2(x, y);
    phi = authlat(Math.asin(ab), this.apa);
  }
  p.x = adjust_lon_default(this.long0 + lam, this.over);
  p.y = phi;
  return p;
}
var S_POLE, N_POLE, EQUIT, OBLIQ, names15, laea_default;
var init_laea = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/laea.js"() {
    init_values();
    init_qsfnz();
    init_adjust_lon();
    init_authset();
    init_authlat();
    S_POLE = 1;
    N_POLE = 2;
    EQUIT = 3;
    OBLIQ = 4;
    names15 = ["Lambert Azimuthal Equal Area", "Lambert_Azimuthal_Equal_Area", "laea"];
    laea_default = {
      init: init14,
      forward: forward13,
      inverse: inverse13,
      names: names15,
      S_POLE,
      N_POLE,
      EQUIT,
      OBLIQ
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/asinz.js
function asinz_default(x) {
  if (Math.abs(x) > 1) {
    x = x > 1 ? 1 : -1;
  }
  return Math.asin(x);
}
var init_asinz = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/asinz.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/aea.js
function init15() {
  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2);
  this.e3 = Math.sqrt(this.es);
  this.sin_po = Math.sin(this.lat1);
  this.cos_po = Math.cos(this.lat1);
  this.t1 = this.sin_po;
  this.con = this.sin_po;
  this.ms1 = msfnz_default(this.e3, this.sin_po, this.cos_po);
  this.qs1 = qsfnz_default(this.e3, this.sin_po);
  this.sin_po = Math.sin(this.lat2);
  this.cos_po = Math.cos(this.lat2);
  this.t2 = this.sin_po;
  this.ms2 = msfnz_default(this.e3, this.sin_po, this.cos_po);
  this.qs2 = qsfnz_default(this.e3, this.sin_po);
  this.sin_po = Math.sin(this.lat0);
  this.cos_po = Math.cos(this.lat0);
  this.t3 = this.sin_po;
  this.qs0 = qsfnz_default(this.e3, this.sin_po);
  if (Math.abs(this.lat1 - this.lat2) > EPSLN) {
    this.ns0 = (this.ms1 * this.ms1 - this.ms2 * this.ms2) / (this.qs2 - this.qs1);
  } else {
    this.ns0 = this.con;
  }
  this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1;
  this.rh = this.a * Math.sqrt(this.c - this.ns0 * this.qs0) / this.ns0;
}
function forward14(p) {
  var lon = p.x;
  var lat = p.y;
  this.sin_phi = Math.sin(lat);
  this.cos_phi = Math.cos(lat);
  var qs = qsfnz_default(this.e3, this.sin_phi);
  var rh1 = this.a * Math.sqrt(this.c - this.ns0 * qs) / this.ns0;
  var theta = this.ns0 * adjust_lon_default(lon - this.long0, this.over);
  var x = rh1 * Math.sin(theta) + this.x0;
  var y = this.rh - rh1 * Math.cos(theta) + this.y0;
  p.x = x;
  p.y = y;
  return p;
}
function inverse14(p) {
  var rh1, qs, con, theta, lon, lat;
  p.x -= this.x0;
  p.y = this.rh - p.y + this.y0;
  if (this.ns0 >= 0) {
    rh1 = Math.sqrt(p.x * p.x + p.y * p.y);
    con = 1;
  } else {
    rh1 = -Math.sqrt(p.x * p.x + p.y * p.y);
    con = -1;
  }
  theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2(con * p.x, con * p.y);
  }
  con = rh1 * this.ns0 / this.a;
  if (this.sphere) {
    lat = Math.asin((this.c - con * con) / (2 * this.ns0));
  } else {
    qs = (this.c - con * con) / this.ns0;
    lat = this.phi1z(this.e3, qs);
  }
  lon = adjust_lon_default(theta / this.ns0 + this.long0, this.over);
  p.x = lon;
  p.y = lat;
  return p;
}
function phi1z(eccent, qs) {
  var sinphi, cosphi, con, com, dphi;
  var phi = asinz_default(0.5 * qs);
  if (eccent < EPSLN) {
    return phi;
  }
  var eccnts = eccent * eccent;
  for (var i = 1; i <= 25; i++) {
    sinphi = Math.sin(phi);
    cosphi = Math.cos(phi);
    con = eccent * sinphi;
    com = 1 - con * con;
    dphi = 0.5 * com * com / cosphi * (qs / (1 - eccnts) - sinphi / com + 0.5 / eccent * Math.log((1 - con) / (1 + con)));
    phi = phi + dphi;
    if (Math.abs(dphi) <= 1e-7) {
      return phi;
    }
  }
  return null;
}
var names16, aea_default;
var init_aea = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/aea.js"() {
    init_msfnz();
    init_qsfnz();
    init_adjust_lon();
    init_asinz();
    init_values();
    names16 = ["Albers_Conic_Equal_Area", "Albers_Equal_Area", "Albers", "aea"];
    aea_default = {
      init: init15,
      forward: forward14,
      inverse: inverse14,
      names: names16,
      phi1z
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/gnom.js
function init16() {
  this.sin_p14 = Math.sin(this.lat0);
  this.cos_p14 = Math.cos(this.lat0);
  this.infinity_dist = 1e3 * this.a;
  this.rc = 1;
}
function forward15(p) {
  var sinphi, cosphi;
  var dlon;
  var coslon;
  var ksp;
  var g;
  var x, y;
  var lon = p.x;
  var lat = p.y;
  dlon = adjust_lon_default(lon - this.long0, this.over);
  sinphi = Math.sin(lat);
  cosphi = Math.cos(lat);
  coslon = Math.cos(dlon);
  g = this.sin_p14 * sinphi + this.cos_p14 * cosphi * coslon;
  ksp = 1;
  if (g > 0 || Math.abs(g) <= EPSLN) {
    x = this.x0 + this.a * ksp * cosphi * Math.sin(dlon) / g;
    y = this.y0 + this.a * ksp * (this.cos_p14 * sinphi - this.sin_p14 * cosphi * coslon) / g;
  } else {
    x = this.x0 + this.infinity_dist * cosphi * Math.sin(dlon);
    y = this.y0 + this.infinity_dist * (this.cos_p14 * sinphi - this.sin_p14 * cosphi * coslon);
  }
  p.x = x;
  p.y = y;
  return p;
}
function inverse15(p) {
  var rh;
  var sinc, cosc;
  var c;
  var lon, lat;
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;
  p.x /= this.k0;
  p.y /= this.k0;
  if (rh = Math.sqrt(p.x * p.x + p.y * p.y)) {
    c = Math.atan2(rh, this.rc);
    sinc = Math.sin(c);
    cosc = Math.cos(c);
    lat = asinz_default(cosc * this.sin_p14 + p.y * sinc * this.cos_p14 / rh);
    lon = Math.atan2(p.x * sinc, rh * this.cos_p14 * cosc - p.y * this.sin_p14 * sinc);
    lon = adjust_lon_default(this.long0 + lon, this.over);
  } else {
    lat = this.phic0;
    lon = 0;
  }
  p.x = lon;
  p.y = lat;
  return p;
}
var names17, gnom_default;
var init_gnom = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/gnom.js"() {
    init_adjust_lon();
    init_asinz();
    init_values();
    names17 = ["gnom"];
    gnom_default = {
      init: init16,
      forward: forward15,
      inverse: inverse15,
      names: names17
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/iqsfnz.js
function iqsfnz_default(eccent, q) {
  var temp = 1 - (1 - eccent * eccent) / (2 * eccent) * Math.log((1 - eccent) / (1 + eccent));
  if (Math.abs(Math.abs(q) - temp) < 1e-6) {
    if (q < 0) {
      return -1 * HALF_PI;
    } else {
      return HALF_PI;
    }
  }
  var phi = Math.asin(0.5 * q);
  var dphi;
  var sin_phi;
  var cos_phi;
  var con;
  for (var i = 0; i < 30; i++) {
    sin_phi = Math.sin(phi);
    cos_phi = Math.cos(phi);
    con = eccent * sin_phi;
    dphi = Math.pow(1 - con * con, 2) / (2 * cos_phi) * (q / (1 - eccent * eccent) - sin_phi / (1 - con * con) + 0.5 / eccent * Math.log((1 - con) / (1 + con)));
    phi += dphi;
    if (Math.abs(dphi) <= 1e-10) {
      return phi;
    }
  }
  return NaN;
}
var init_iqsfnz = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/iqsfnz.js"() {
    init_values();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/cea.js
function init17() {
  if (!this.sphere) {
    this.k0 = msfnz_default(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts));
  }
}
function forward16(p) {
  var lon = p.x;
  var lat = p.y;
  var x, y;
  var dlon = adjust_lon_default(lon - this.long0, this.over);
  if (this.sphere) {
    x = this.x0 + this.a * dlon * Math.cos(this.lat_ts);
    y = this.y0 + this.a * Math.sin(lat) / Math.cos(this.lat_ts);
  } else {
    var qs = qsfnz_default(this.e, Math.sin(lat));
    x = this.x0 + this.a * this.k0 * dlon;
    y = this.y0 + this.a * qs * 0.5 / this.k0;
  }
  p.x = x;
  p.y = y;
  return p;
}
function inverse16(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var lon, lat;
  if (this.sphere) {
    lon = adjust_lon_default(this.long0 + p.x / this.a / Math.cos(this.lat_ts), this.over);
    lat = Math.asin(p.y / this.a * Math.cos(this.lat_ts));
  } else {
    lat = iqsfnz_default(this.e, 2 * p.y * this.k0 / this.a);
    lon = adjust_lon_default(this.long0 + p.x / (this.a * this.k0), this.over);
  }
  p.x = lon;
  p.y = lat;
  return p;
}
var names18, cea_default;
var init_cea = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/cea.js"() {
    init_adjust_lon();
    init_qsfnz();
    init_msfnz();
    init_iqsfnz();
    names18 = ["cea"];
    cea_default = {
      init: init17,
      forward: forward16,
      inverse: inverse16,
      names: names18
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/eqc.js
function init18() {
  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  this.lat0 = this.lat0 || 0;
  this.long0 = this.long0 || 0;
  this.lat_ts = this.lat_ts || 0;
  this.title = this.title || "Equidistant Cylindrical (Plate Carre)";
  this.rc = Math.cos(this.lat_ts);
}
function forward17(p) {
  var lon = p.x;
  var lat = p.y;
  var dlon = adjust_lon_default(lon - this.long0, this.over);
  var dlat = adjust_lat_default(lat - this.lat0);
  p.x = this.x0 + this.a * dlon * this.rc;
  p.y = this.y0 + this.a * dlat;
  return p;
}
function inverse17(p) {
  var x = p.x;
  var y = p.y;
  p.x = adjust_lon_default(this.long0 + (x - this.x0) / (this.a * this.rc), this.over);
  p.y = adjust_lat_default(this.lat0 + (y - this.y0) / this.a);
  return p;
}
var names19, eqc_default;
var init_eqc = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/eqc.js"() {
    init_adjust_lon();
    init_adjust_lat();
    names19 = ["Equirectangular", "Equidistant_Cylindrical", "Equidistant_Cylindrical_Spherical", "eqc"];
    eqc_default = {
      init: init18,
      forward: forward17,
      inverse: inverse17,
      names: names19
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/poly.js
function init19() {
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2);
  this.e = Math.sqrt(this.es);
  this.e0 = e0fn_default(this.es);
  this.e1 = e1fn_default(this.es);
  this.e2 = e2fn_default(this.es);
  this.e3 = e3fn_default(this.es);
  this.ml0 = this.a * mlfn_default(this.e0, this.e1, this.e2, this.e3, this.lat0);
}
function forward18(p) {
  var lon = p.x;
  var lat = p.y;
  var x, y, el;
  var dlon = adjust_lon_default(lon - this.long0, this.over);
  el = dlon * Math.sin(lat);
  if (this.sphere) {
    if (Math.abs(lat) <= EPSLN) {
      x = this.a * dlon;
      y = -1 * this.a * this.lat0;
    } else {
      x = this.a * Math.sin(el) / Math.tan(lat);
      y = this.a * (adjust_lat_default(lat - this.lat0) + (1 - Math.cos(el)) / Math.tan(lat));
    }
  } else {
    if (Math.abs(lat) <= EPSLN) {
      x = this.a * dlon;
      y = -1 * this.ml0;
    } else {
      var nl = gN_default(this.a, this.e, Math.sin(lat)) / Math.tan(lat);
      x = nl * Math.sin(el);
      y = this.a * mlfn_default(this.e0, this.e1, this.e2, this.e3, lat) - this.ml0 + nl * (1 - Math.cos(el));
    }
  }
  p.x = x + this.x0;
  p.y = y + this.y0;
  return p;
}
function inverse18(p) {
  var lon, lat, x, y, i;
  var al, bl;
  var phi, dphi;
  x = p.x - this.x0;
  y = p.y - this.y0;
  if (this.sphere) {
    if (Math.abs(y + this.a * this.lat0) <= EPSLN) {
      lon = adjust_lon_default(x / this.a + this.long0, this.over);
      lat = 0;
    } else {
      al = this.lat0 + y / this.a;
      bl = x * x / this.a / this.a + al * al;
      phi = al;
      var tanphi;
      for (i = MAX_ITER3; i; --i) {
        tanphi = Math.tan(phi);
        dphi = -1 * (al * (phi * tanphi + 1) - phi - 0.5 * (phi * phi + bl) * tanphi) / ((phi - al) / tanphi - 1);
        phi += dphi;
        if (Math.abs(dphi) <= EPSLN) {
          lat = phi;
          break;
        }
      }
      lon = adjust_lon_default(this.long0 + Math.asin(x * Math.tan(phi) / this.a) / Math.sin(lat), this.over);
    }
  } else {
    if (Math.abs(y + this.ml0) <= EPSLN) {
      lat = 0;
      lon = adjust_lon_default(this.long0 + x / this.a, this.over);
    } else {
      al = (this.ml0 + y) / this.a;
      bl = x * x / this.a / this.a + al * al;
      phi = al;
      var cl, mln, mlnp, ma;
      var con;
      for (i = MAX_ITER3; i; --i) {
        con = this.e * Math.sin(phi);
        cl = Math.sqrt(1 - con * con) * Math.tan(phi);
        mln = this.a * mlfn_default(this.e0, this.e1, this.e2, this.e3, phi);
        mlnp = this.e0 - 2 * this.e1 * Math.cos(2 * phi) + 4 * this.e2 * Math.cos(4 * phi) - 6 * this.e3 * Math.cos(6 * phi);
        ma = mln / this.a;
        dphi = (al * (cl * ma + 1) - ma - 0.5 * cl * (ma * ma + bl)) / (this.es * Math.sin(2 * phi) * (ma * ma + bl - 2 * al * ma) / (4 * cl) + (al - ma) * (cl * mlnp - 2 / Math.sin(2 * phi)) - mlnp);
        phi -= dphi;
        if (Math.abs(dphi) <= EPSLN) {
          lat = phi;
          break;
        }
      }
      cl = Math.sqrt(1 - this.es * Math.pow(Math.sin(lat), 2)) * Math.tan(lat);
      lon = adjust_lon_default(this.long0 + Math.asin(x * cl / this.a) / Math.sin(lat), this.over);
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
}
var MAX_ITER3, names20, poly_default;
var init_poly = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/poly.js"() {
    init_e0fn();
    init_e1fn();
    init_e2fn();
    init_e3fn();
    init_adjust_lon();
    init_adjust_lat();
    init_mlfn();
    init_values();
    init_gN();
    MAX_ITER3 = 20;
    names20 = ["Polyconic", "American_Polyconic", "poly"];
    poly_default = {
      init: init19,
      forward: forward18,
      inverse: inverse18,
      names: names20
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/nzmg.js
function init20() {
  this.A = [];
  this.A[1] = 0.6399175073;
  this.A[2] = -0.1358797613;
  this.A[3] = 0.063294409;
  this.A[4] = -0.02526853;
  this.A[5] = 0.0117879;
  this.A[6] = -55161e-7;
  this.A[7] = 26906e-7;
  this.A[8] = -1333e-6;
  this.A[9] = 67e-5;
  this.A[10] = -34e-5;
  this.B_re = [];
  this.B_im = [];
  this.B_re[1] = 0.7557853228;
  this.B_im[1] = 0;
  this.B_re[2] = 0.249204646;
  this.B_im[2] = 3371507e-9;
  this.B_re[3] = -1541739e-9;
  this.B_im[3] = 0.04105856;
  this.B_re[4] = -0.10162907;
  this.B_im[4] = 0.01727609;
  this.B_re[5] = -0.26623489;
  this.B_im[5] = -0.36249218;
  this.B_re[6] = -0.6870983;
  this.B_im[6] = -1.1651967;
  this.C_re = [];
  this.C_im = [];
  this.C_re[1] = 1.3231270439;
  this.C_im[1] = 0;
  this.C_re[2] = -0.577245789;
  this.C_im[2] = -7809598e-9;
  this.C_re[3] = 0.508307513;
  this.C_im[3] = -0.112208952;
  this.C_re[4] = -0.15094762;
  this.C_im[4] = 0.18200602;
  this.C_re[5] = 1.01418179;
  this.C_im[5] = 1.64497696;
  this.C_re[6] = 1.9660549;
  this.C_im[6] = 2.5127645;
  this.D = [];
  this.D[1] = 1.5627014243;
  this.D[2] = 0.5185406398;
  this.D[3] = -0.03333098;
  this.D[4] = -0.1052906;
  this.D[5] = -0.0368594;
  this.D[6] = 7317e-6;
  this.D[7] = 0.0122;
  this.D[8] = 394e-5;
  this.D[9] = -13e-4;
}
function forward19(p) {
  var n;
  var lon = p.x;
  var lat = p.y;
  var delta_lat = lat - this.lat0;
  var delta_lon = lon - this.long0;
  var d_phi = delta_lat / SEC_TO_RAD * 1e-5;
  var d_lambda = delta_lon;
  var d_phi_n = 1;
  var d_psi = 0;
  for (n = 1; n <= 10; n++) {
    d_phi_n = d_phi_n * d_phi;
    d_psi = d_psi + this.A[n] * d_phi_n;
  }
  var th_re = d_psi;
  var th_im = d_lambda;
  var th_n_re = 1;
  var th_n_im = 0;
  var th_n_re1;
  var th_n_im1;
  var z_re = 0;
  var z_im = 0;
  for (n = 1; n <= 6; n++) {
    th_n_re1 = th_n_re * th_re - th_n_im * th_im;
    th_n_im1 = th_n_im * th_re + th_n_re * th_im;
    th_n_re = th_n_re1;
    th_n_im = th_n_im1;
    z_re = z_re + this.B_re[n] * th_n_re - this.B_im[n] * th_n_im;
    z_im = z_im + this.B_im[n] * th_n_re + this.B_re[n] * th_n_im;
  }
  p.x = z_im * this.a + this.x0;
  p.y = z_re * this.a + this.y0;
  return p;
}
function inverse19(p) {
  var n;
  var x = p.x;
  var y = p.y;
  var delta_x = x - this.x0;
  var delta_y = y - this.y0;
  var z_re = delta_y / this.a;
  var z_im = delta_x / this.a;
  var z_n_re = 1;
  var z_n_im = 0;
  var z_n_re1;
  var z_n_im1;
  var th_re = 0;
  var th_im = 0;
  for (n = 1; n <= 6; n++) {
    z_n_re1 = z_n_re * z_re - z_n_im * z_im;
    z_n_im1 = z_n_im * z_re + z_n_re * z_im;
    z_n_re = z_n_re1;
    z_n_im = z_n_im1;
    th_re = th_re + this.C_re[n] * z_n_re - this.C_im[n] * z_n_im;
    th_im = th_im + this.C_im[n] * z_n_re + this.C_re[n] * z_n_im;
  }
  for (var i = 0; i < this.iterations; i++) {
    var th_n_re = th_re;
    var th_n_im = th_im;
    var th_n_re1;
    var th_n_im1;
    var num_re = z_re;
    var num_im = z_im;
    for (n = 2; n <= 6; n++) {
      th_n_re1 = th_n_re * th_re - th_n_im * th_im;
      th_n_im1 = th_n_im * th_re + th_n_re * th_im;
      th_n_re = th_n_re1;
      th_n_im = th_n_im1;
      num_re = num_re + (n - 1) * (this.B_re[n] * th_n_re - this.B_im[n] * th_n_im);
      num_im = num_im + (n - 1) * (this.B_im[n] * th_n_re + this.B_re[n] * th_n_im);
    }
    th_n_re = 1;
    th_n_im = 0;
    var den_re = this.B_re[1];
    var den_im = this.B_im[1];
    for (n = 2; n <= 6; n++) {
      th_n_re1 = th_n_re * th_re - th_n_im * th_im;
      th_n_im1 = th_n_im * th_re + th_n_re * th_im;
      th_n_re = th_n_re1;
      th_n_im = th_n_im1;
      den_re = den_re + n * (this.B_re[n] * th_n_re - this.B_im[n] * th_n_im);
      den_im = den_im + n * (this.B_im[n] * th_n_re + this.B_re[n] * th_n_im);
    }
    var den2 = den_re * den_re + den_im * den_im;
    th_re = (num_re * den_re + num_im * den_im) / den2;
    th_im = (num_im * den_re - num_re * den_im) / den2;
  }
  var d_psi = th_re;
  var d_lambda = th_im;
  var d_psi_n = 1;
  var d_phi = 0;
  for (n = 1; n <= 9; n++) {
    d_psi_n = d_psi_n * d_psi;
    d_phi = d_phi + this.D[n] * d_psi_n;
  }
  var lat = this.lat0 + d_phi * SEC_TO_RAD * 1e5;
  var lon = this.long0 + d_lambda;
  p.x = lon;
  p.y = lat;
  return p;
}
var names21, nzmg_default;
var init_nzmg = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/nzmg.js"() {
    init_values();
    names21 = ["New_Zealand_Map_Grid", "nzmg"];
    nzmg_default = {
      init: init20,
      forward: forward19,
      inverse: inverse19,
      names: names21
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/mill.js
function init21() {
}
function forward20(p) {
  var lon = p.x;
  var lat = p.y;
  var dlon = adjust_lon_default(lon - this.long0, this.over);
  var x = this.x0 + this.a * dlon;
  var y = this.y0 + this.a * Math.log(Math.tan(Math.PI / 4 + lat / 2.5)) * 1.25;
  p.x = x;
  p.y = y;
  return p;
}
function inverse20(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var lon = adjust_lon_default(this.long0 + p.x / this.a, this.over);
  var lat = 2.5 * (Math.atan(Math.exp(0.8 * p.y / this.a)) - Math.PI / 4);
  p.x = lon;
  p.y = lat;
  return p;
}
var names22, mill_default;
var init_mill = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/mill.js"() {
    init_adjust_lon();
    names22 = ["Miller_Cylindrical", "mill"];
    mill_default = {
      init: init21,
      forward: forward20,
      inverse: inverse20,
      names: names22
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/sinu.js
function init22() {
  this.long0 = this.long0 || 0;
  if (!this.sphere) {
    this.en = pj_enfn_default(this.es);
  } else {
    this.n = 1;
    this.m = 0;
    this.es = 0;
    this.C_y = Math.sqrt((this.m + 1) / this.n);
    this.C_x = this.C_y / (this.m + 1);
  }
}
function forward21(p) {
  var x, y;
  var lon = p.x;
  var lat = p.y;
  lon = adjust_lon_default(lon - this.long0, this.over);
  if (this.sphere) {
    if (!this.m) {
      lat = this.n !== 1 ? Math.asin(this.n * Math.sin(lat)) : lat;
    } else {
      var k = this.n * Math.sin(lat);
      for (var i = MAX_ITER4; i; --i) {
        var V2 = (this.m * lat + Math.sin(lat) - k) / (this.m + Math.cos(lat));
        lat -= V2;
        if (Math.abs(V2) < EPSLN) {
          break;
        }
      }
    }
    x = this.a * this.C_x * lon * (this.m + Math.cos(lat));
    y = this.a * this.C_y * lat;
  } else {
    var s = Math.sin(lat);
    var c = Math.cos(lat);
    y = this.a * pj_mlfn_default(lat, s, c, this.en);
    x = this.a * lon * c / Math.sqrt(1 - this.es * s * s);
  }
  p.x = x;
  p.y = y;
  return p;
}
function inverse21(p) {
  var lat, temp, lon, s;
  p.x -= this.x0;
  lon = p.x / this.a;
  p.y -= this.y0;
  lat = p.y / this.a;
  if (this.sphere) {
    lat /= this.C_y;
    lon = lon / (this.C_x * (this.m + Math.cos(lat)));
    if (this.m) {
      lat = asinz_default((this.m * lat + Math.sin(lat)) / this.n);
    } else if (this.n !== 1) {
      lat = asinz_default(Math.sin(lat) / this.n);
    }
    lon = adjust_lon_default(lon + this.long0, this.over);
    lat = adjust_lat_default(lat);
  } else {
    lat = pj_inv_mlfn_default(p.y / this.a, this.es, this.en);
    s = Math.abs(lat);
    if (s < HALF_PI) {
      s = Math.sin(lat);
      temp = this.long0 + p.x * Math.sqrt(1 - this.es * s * s) / (this.a * Math.cos(lat));
      lon = adjust_lon_default(temp, this.over);
    } else if (s - EPSLN < HALF_PI) {
      lon = this.long0;
    }
  }
  p.x = lon;
  p.y = lat;
  return p;
}
var MAX_ITER4, names23, sinu_default;
var init_sinu = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/sinu.js"() {
    init_adjust_lon();
    init_adjust_lat();
    init_pj_enfn();
    init_pj_mlfn();
    init_pj_inv_mlfn();
    init_values();
    init_asinz();
    MAX_ITER4 = 20;
    names23 = ["Sinusoidal", "sinu"];
    sinu_default = {
      init: init22,
      forward: forward21,
      inverse: inverse21,
      names: names23
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/eck6.js
function init23() {
  this.sphere = true;
  this.b = this.a;
  this.m = 1;
  this.n = 2.5707963267948966;
  this.es = 0;
  this.C_y = Math.sqrt((this.m + 1) / this.n);
  this.C_x = this.C_y / (this.m + 1);
}
var forward22, inverse22, names24, eck6_default;
var init_eck6 = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/eck6.js"() {
    init_sinu();
    forward22 = forward21;
    inverse22 = inverse21;
    names24 = ["Eckert_VI", "eck6"];
    eck6_default = {
      init: init23,
      forward: forward22,
      inverse: inverse22,
      names: names24
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/moll.js
function init24() {
  this.x0 = this.x0 !== void 0 ? this.x0 : 0;
  this.y0 = this.y0 !== void 0 ? this.y0 : 0;
  this.long0 = this.long0 !== void 0 ? this.long0 : 0;
}
function forward23(p) {
  var lon = p.x;
  var lat = p.y;
  var delta_lon = adjust_lon_default(lon - this.long0, this.over);
  var theta = lat;
  var con = Math.PI * Math.sin(lat);
  while (true) {
    var delta_theta = -(theta + Math.sin(theta) - con) / (1 + Math.cos(theta));
    theta += delta_theta;
    if (Math.abs(delta_theta) < EPSLN) {
      break;
    }
  }
  theta /= 2;
  if (Math.PI / 2 - Math.abs(lat) < EPSLN) {
    delta_lon = 0;
  }
  var x = 0.900316316158 * this.a * delta_lon * Math.cos(theta) + this.x0;
  var y = 1.4142135623731 * this.a * Math.sin(theta) + this.y0;
  p.x = x;
  p.y = y;
  return p;
}
function inverse23(p) {
  var theta;
  var arg;
  p.x -= this.x0;
  p.y -= this.y0;
  arg = p.y / (1.4142135623731 * this.a);
  if (Math.abs(arg) > 0.999999999999) {
    arg = 0.999999999999;
  }
  theta = Math.asin(arg);
  var lon = adjust_lon_default(this.long0 + p.x / (0.900316316158 * this.a * Math.cos(theta)), this.over);
  if (lon < -Math.PI) {
    lon = -Math.PI;
  }
  if (lon > Math.PI) {
    lon = Math.PI;
  }
  arg = (2 * theta + Math.sin(2 * theta)) / Math.PI;
  if (Math.abs(arg) > 1) {
    arg = 1;
  }
  var lat = Math.asin(arg);
  p.x = lon;
  p.y = lat;
  return p;
}
var names25, moll_default;
var init_moll = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/moll.js"() {
    init_adjust_lon();
    init_values();
    names25 = ["Mollweide", "moll"];
    moll_default = {
      init: init24,
      forward: forward23,
      inverse: inverse23,
      names: names25
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/eqdc.js
function init25() {
  if (Math.abs(this.lat1 + this.lat2) < EPSLN) {
    return;
  }
  this.lat2 = this.lat2 || this.lat1;
  this.temp = this.b / this.a;
  this.es = 1 - Math.pow(this.temp, 2);
  this.e = Math.sqrt(this.es);
  this.e0 = e0fn_default(this.es);
  this.e1 = e1fn_default(this.es);
  this.e2 = e2fn_default(this.es);
  this.e3 = e3fn_default(this.es);
  this.sin_phi = Math.sin(this.lat1);
  this.cos_phi = Math.cos(this.lat1);
  this.ms1 = msfnz_default(this.e, this.sin_phi, this.cos_phi);
  this.ml1 = mlfn_default(this.e0, this.e1, this.e2, this.e3, this.lat1);
  if (Math.abs(this.lat1 - this.lat2) < EPSLN) {
    this.ns = this.sin_phi;
  } else {
    this.sin_phi = Math.sin(this.lat2);
    this.cos_phi = Math.cos(this.lat2);
    this.ms2 = msfnz_default(this.e, this.sin_phi, this.cos_phi);
    this.ml2 = mlfn_default(this.e0, this.e1, this.e2, this.e3, this.lat2);
    this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1);
  }
  this.g = this.ml1 + this.ms1 / this.ns;
  this.ml0 = mlfn_default(this.e0, this.e1, this.e2, this.e3, this.lat0);
  this.rh = this.a * (this.g - this.ml0);
}
function forward24(p) {
  var lon = p.x;
  var lat = p.y;
  var rh1;
  if (this.sphere) {
    rh1 = this.a * (this.g - lat);
  } else {
    var ml = mlfn_default(this.e0, this.e1, this.e2, this.e3, lat);
    rh1 = this.a * (this.g - ml);
  }
  var theta = this.ns * adjust_lon_default(lon - this.long0, this.over);
  var x = this.x0 + rh1 * Math.sin(theta);
  var y = this.y0 + this.rh - rh1 * Math.cos(theta);
  p.x = x;
  p.y = y;
  return p;
}
function inverse24(p) {
  p.x -= this.x0;
  p.y = this.rh - p.y + this.y0;
  var con, rh1, lat, lon;
  if (this.ns >= 0) {
    rh1 = Math.sqrt(p.x * p.x + p.y * p.y);
    con = 1;
  } else {
    rh1 = -Math.sqrt(p.x * p.x + p.y * p.y);
    con = -1;
  }
  var theta = 0;
  if (rh1 !== 0) {
    theta = Math.atan2(con * p.x, con * p.y);
  }
  if (this.sphere) {
    lon = adjust_lon_default(this.long0 + theta / this.ns, this.over);
    lat = adjust_lat_default(this.g - rh1 / this.a);
    p.x = lon;
    p.y = lat;
    return p;
  } else {
    var ml = this.g - rh1 / this.a;
    lat = imlfn_default(ml, this.e0, this.e1, this.e2, this.e3);
    lon = adjust_lon_default(this.long0 + theta / this.ns, this.over);
    p.x = lon;
    p.y = lat;
    return p;
  }
}
var names26, eqdc_default;
var init_eqdc = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/eqdc.js"() {
    init_e0fn();
    init_e1fn();
    init_e2fn();
    init_e3fn();
    init_msfnz();
    init_mlfn();
    init_adjust_lon();
    init_adjust_lat();
    init_imlfn();
    init_values();
    names26 = ["Equidistant_Conic", "eqdc"];
    eqdc_default = {
      init: init25,
      forward: forward24,
      inverse: inverse24,
      names: names26
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/vandg.js
function init26() {
  this.R = this.a;
}
function forward25(p) {
  var lon = p.x;
  var lat = p.y;
  var dlon = adjust_lon_default(lon - this.long0, this.over);
  var x, y;
  if (Math.abs(lat) <= EPSLN) {
    x = this.x0 + this.R * dlon;
    y = this.y0;
  }
  var theta = asinz_default(2 * Math.abs(lat / Math.PI));
  if (Math.abs(dlon) <= EPSLN || Math.abs(Math.abs(lat) - HALF_PI) <= EPSLN) {
    x = this.x0;
    if (lat >= 0) {
      y = this.y0 + Math.PI * this.R * Math.tan(0.5 * theta);
    } else {
      y = this.y0 + Math.PI * this.R * -Math.tan(0.5 * theta);
    }
  }
  var al = 0.5 * Math.abs(Math.PI / dlon - dlon / Math.PI);
  var asq = al * al;
  var sinth = Math.sin(theta);
  var costh = Math.cos(theta);
  var g = costh / (sinth + costh - 1);
  var gsq = g * g;
  var m = g * (2 / sinth - 1);
  var msq = m * m;
  var con = Math.PI * this.R * (al * (g - msq) + Math.sqrt(asq * (g - msq) * (g - msq) - (msq + asq) * (gsq - msq))) / (msq + asq);
  if (dlon < 0) {
    con = -con;
  }
  x = this.x0 + con;
  var q = asq + g;
  con = Math.PI * this.R * (m * q - al * Math.sqrt((msq + asq) * (asq + 1) - q * q)) / (msq + asq);
  if (lat >= 0) {
    y = this.y0 + con;
  } else {
    y = this.y0 - con;
  }
  p.x = x;
  p.y = y;
  return p;
}
function inverse25(p) {
  var lon, lat;
  var xx, yy, xys, c1, c2, c3;
  var a1;
  var m1;
  var con;
  var th1;
  var d;
  p.x -= this.x0;
  p.y -= this.y0;
  con = Math.PI * this.R;
  xx = p.x / con;
  yy = p.y / con;
  xys = xx * xx + yy * yy;
  c1 = -Math.abs(yy) * (1 + xys);
  c2 = c1 - 2 * yy * yy + xx * xx;
  c3 = -2 * c1 + 1 + 2 * yy * yy + xys * xys;
  d = yy * yy / c3 + (2 * c2 * c2 * c2 / c3 / c3 / c3 - 9 * c1 * c2 / c3 / c3) / 27;
  a1 = (c1 - c2 * c2 / 3 / c3) / c3;
  m1 = 2 * Math.sqrt(-a1 / 3);
  con = 3 * d / a1 / m1;
  if (Math.abs(con) > 1) {
    if (con >= 0) {
      con = 1;
    } else {
      con = -1;
    }
  }
  th1 = Math.acos(con) / 3;
  if (p.y >= 0) {
    lat = (-m1 * Math.cos(th1 + Math.PI / 3) - c2 / 3 / c3) * Math.PI;
  } else {
    lat = -(-m1 * Math.cos(th1 + Math.PI / 3) - c2 / 3 / c3) * Math.PI;
  }
  if (Math.abs(xx) < EPSLN) {
    lon = this.long0;
  } else {
    lon = adjust_lon_default(this.long0 + Math.PI * (xys - 1 + Math.sqrt(1 + 2 * (xx * xx - yy * yy) + xys * xys)) / 2 / xx, this.over);
  }
  p.x = lon;
  p.y = lat;
  return p;
}
var names27, vandg_default;
var init_vandg = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/vandg.js"() {
    init_adjust_lon();
    init_values();
    init_asinz();
    names27 = ["Van_der_Grinten_I", "VanDerGrinten", "Van_der_Grinten", "vandg"];
    vandg_default = {
      init: init26,
      forward: forward25,
      inverse: inverse25,
      names: names27
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/vincenty.js
function vincentyInverse(lat1, lon1, lat2, lon2, a, f) {
  const L = lon2 - lon1;
  const U1 = Math.atan((1 - f) * Math.tan(lat1));
  const U2 = Math.atan((1 - f) * Math.tan(lat2));
  const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);
  let lambda = L, lambdaP, iterLimit = 100;
  let sinLambda, cosLambda, sinSigma, cosSigma, sigma, sinAlpha, cos2Alpha, cos2SigmaM, C;
  let uSq, A5, B, deltaSigma, s;
  do {
    sinLambda = Math.sin(lambda);
    cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt(
      cosU2 * sinLambda * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda)
    );
    if (sinSigma === 0) {
      return { azi1: 0, s12: 0 };
    }
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
    cos2Alpha = 1 - sinAlpha * sinAlpha;
    cos2SigmaM = cos2Alpha !== 0 ? cosSigma - 2 * sinU1 * sinU2 / cos2Alpha : 0;
    C = f / 16 * cos2Alpha * (4 + f * (4 - 3 * cos2Alpha));
    lambdaP = lambda;
    lambda = L + (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);
  if (iterLimit === 0) {
    return { azi1: NaN, s12: NaN };
  }
  uSq = cos2Alpha * (a * a - a * (1 - f) * (a * (1 - f))) / (a * (1 - f) * (a * (1 - f)));
  A5 = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
  s = a * (1 - f) * A5 * (sigma - deltaSigma);
  const azi1 = Math.atan2(cosU2 * sinLambda, cosU1 * sinU2 - sinU1 * cosU2 * cosLambda);
  return { azi1, s12: s };
}
function vincentyDirect(lat1, lon1, azi1, s12, a, f) {
  const U1 = Math.atan((1 - f) * Math.tan(lat1));
  const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
  const sinAlpha1 = Math.sin(azi1), cosAlpha1 = Math.cos(azi1);
  const sigma1 = Math.atan2(sinU1, cosU1 * cosAlpha1);
  const sinAlpha = cosU1 * sinAlpha1;
  const cos2Alpha = 1 - sinAlpha * sinAlpha;
  const uSq = cos2Alpha * (a * a - a * (1 - f) * (a * (1 - f))) / (a * (1 - f) * (a * (1 - f)));
  const A5 = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  const B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  let sigma = s12 / (a * (1 - f) * A5), sigmaP, iterLimit = 100;
  let cos2SigmaM, sinSigma, cosSigma, deltaSigma;
  do {
    cos2SigmaM = Math.cos(2 * sigma1 + sigma);
    sinSigma = Math.sin(sigma);
    cosSigma = Math.cos(sigma);
    deltaSigma = B * sinSigma * (cos2SigmaM + B / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));
    sigmaP = sigma;
    sigma = s12 / (a * (1 - f) * A5) + deltaSigma;
  } while (Math.abs(sigma - sigmaP) > 1e-12 && --iterLimit > 0);
  if (iterLimit === 0) {
    return { lat2: NaN, lon2: NaN };
  }
  const tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
  const lat2 = Math.atan2(
    sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
    (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)
  );
  const lambda = Math.atan2(
    sinSigma * sinAlpha1,
    cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1
  );
  const C = f / 16 * cos2Alpha * (4 + f * (4 - 3 * cos2Alpha));
  const L = lambda - (1 - C) * f * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  const lon2 = lon1 + L;
  return { lat2, lon2 };
}
var init_vincenty = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/common/vincenty.js"() {
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/aeqd.js
function init27() {
  this.sin_p12 = Math.sin(this.lat0);
  this.cos_p12 = Math.cos(this.lat0);
  this.f = this.es / (1 + Math.sqrt(1 - this.es));
}
function forward26(p) {
  var lon = p.x;
  var lat = p.y;
  var sinphi = Math.sin(p.y);
  var cosphi = Math.cos(p.y);
  var dlon = adjust_lon_default(lon - this.long0, this.over);
  var e0, e1, e2, e3, Mlp, Ml, c, kp, cos_c, vars, azi1;
  if (this.sphere) {
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      p.x = this.x0 + this.a * (HALF_PI - lat) * Math.sin(dlon);
      p.y = this.y0 - this.a * (HALF_PI - lat) * Math.cos(dlon);
      return p;
    } else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      p.x = this.x0 + this.a * (HALF_PI + lat) * Math.sin(dlon);
      p.y = this.y0 + this.a * (HALF_PI + lat) * Math.cos(dlon);
      return p;
    } else {
      cos_c = this.sin_p12 * sinphi + this.cos_p12 * cosphi * Math.cos(dlon);
      c = Math.acos(cos_c);
      kp = c ? c / Math.sin(c) : 1;
      p.x = this.x0 + this.a * kp * cosphi * Math.sin(dlon);
      p.y = this.y0 + this.a * kp * (this.cos_p12 * sinphi - this.sin_p12 * cosphi * Math.cos(dlon));
      return p;
    }
  } else {
    e0 = e0fn_default(this.es);
    e1 = e1fn_default(this.es);
    e2 = e2fn_default(this.es);
    e3 = e3fn_default(this.es);
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      Mlp = this.a * mlfn_default(e0, e1, e2, e3, HALF_PI);
      Ml = this.a * mlfn_default(e0, e1, e2, e3, lat);
      p.x = this.x0 + (Mlp - Ml) * Math.sin(dlon);
      p.y = this.y0 - (Mlp - Ml) * Math.cos(dlon);
      return p;
    } else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      Mlp = this.a * mlfn_default(e0, e1, e2, e3, HALF_PI);
      Ml = this.a * mlfn_default(e0, e1, e2, e3, lat);
      p.x = this.x0 + (Mlp + Ml) * Math.sin(dlon);
      p.y = this.y0 + (Mlp + Ml) * Math.cos(dlon);
      return p;
    } else {
      if (Math.abs(lon) < EPSLN && Math.abs(lat - this.lat0) < EPSLN) {
        p.x = p.y = 0;
        return p;
      }
      vars = vincentyInverse(this.lat0, this.long0, lat, lon, this.a, this.f);
      azi1 = vars.azi1;
      p.x = vars.s12 * Math.sin(azi1);
      p.y = vars.s12 * Math.cos(azi1);
      return p;
    }
  }
}
function inverse26(p) {
  p.x -= this.x0;
  p.y -= this.y0;
  var rh, z, sinz, cosz, lon, lat, con, e0, e1, e2, e3, Mlp, M2, azi1, s12, vars;
  if (this.sphere) {
    rh = Math.sqrt(p.x * p.x + p.y * p.y);
    if (rh > 2 * HALF_PI * this.a) {
      return;
    }
    z = rh / this.a;
    sinz = Math.sin(z);
    cosz = Math.cos(z);
    lon = this.long0;
    if (Math.abs(rh) <= EPSLN) {
      lat = this.lat0;
    } else {
      lat = asinz_default(cosz * this.sin_p12 + p.y * sinz * this.cos_p12 / rh);
      con = Math.abs(this.lat0) - HALF_PI;
      if (Math.abs(con) <= EPSLN) {
        if (this.lat0 >= 0) {
          lon = adjust_lon_default(this.long0 + Math.atan2(p.x, -p.y), this.over);
        } else {
          lon = adjust_lon_default(this.long0 - Math.atan2(-p.x, p.y), this.over);
        }
      } else {
        lon = adjust_lon_default(this.long0 + Math.atan2(p.x * sinz, rh * this.cos_p12 * cosz - p.y * this.sin_p12 * sinz), this.over);
      }
    }
    p.x = lon;
    p.y = lat;
    return p;
  } else {
    e0 = e0fn_default(this.es);
    e1 = e1fn_default(this.es);
    e2 = e2fn_default(this.es);
    e3 = e3fn_default(this.es);
    if (Math.abs(this.sin_p12 - 1) <= EPSLN) {
      Mlp = this.a * mlfn_default(e0, e1, e2, e3, HALF_PI);
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      M2 = Mlp - rh;
      lat = imlfn_default(M2 / this.a, e0, e1, e2, e3);
      lon = adjust_lon_default(this.long0 + Math.atan2(p.x, -1 * p.y), this.over);
      p.x = lon;
      p.y = lat;
      return p;
    } else if (Math.abs(this.sin_p12 + 1) <= EPSLN) {
      Mlp = this.a * mlfn_default(e0, e1, e2, e3, HALF_PI);
      rh = Math.sqrt(p.x * p.x + p.y * p.y);
      M2 = rh - Mlp;
      lat = imlfn_default(M2 / this.a, e0, e1, e2, e3);
      lon = adjust_lon_default(this.long0 + Math.atan2(p.x, p.y), this.over);
      p.x = lon;
      p.y = lat;
      return p;
    } else {
      azi1 = Math.atan2(p.x, p.y);
      s12 = Math.sqrt(p.x * p.x + p.y * p.y);
      vars = vincentyDirect(this.lat0, this.long0, azi1, s12, this.a, this.f);
      p.x = vars.lon2;
      p.y = vars.lat2;
      return p;
    }
  }
}
var names28, aeqd_default;
var init_aeqd = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/aeqd.js"() {
    init_adjust_lon();
    init_values();
    init_mlfn();
    init_e0fn();
    init_e1fn();
    init_e2fn();
    init_e3fn();
    init_asinz();
    init_imlfn();
    init_vincenty();
    names28 = ["Azimuthal_Equidistant", "aeqd"];
    aeqd_default = {
      init: init27,
      forward: forward26,
      inverse: inverse26,
      names: names28
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/ortho.js
function init28() {
  this.sin_p14 = Math.sin(this.lat0 || 0);
  this.cos_p14 = Math.cos(this.lat0 || 0);
}
function forward27(p) {
  var sinphi, cosphi;
  var dlon;
  var coslon;
  var ksp;
  var g, x, y;
  var lon = p.x;
  var lat = p.y;
  dlon = adjust_lon_default(lon - (this.long0 || 0), this.over);
  sinphi = Math.sin(lat);
  cosphi = Math.cos(lat);
  coslon = Math.cos(dlon);
  g = this.sin_p14 * sinphi + this.cos_p14 * cosphi * coslon;
  ksp = 1;
  if (g > 0 || Math.abs(g) <= EPSLN) {
    x = this.a * ksp * cosphi * Math.sin(dlon);
    y = (this.y0 || 0) + this.a * ksp * (this.cos_p14 * sinphi - this.sin_p14 * cosphi * coslon);
  }
  p.x = x;
  p.y = y;
  return p;
}
function inverse27(p) {
  var rh;
  var z;
  var sinz, cosz;
  var con;
  var lon, lat;
  var long0, lat0;
  p.x -= this.x0 || 0;
  p.y -= this.y0 || 0;
  rh = Math.sqrt(p.x * p.x + p.y * p.y);
  z = asinz_default(rh / this.a);
  sinz = Math.sin(z);
  cosz = Math.cos(z);
  long0 = this.long0 || 0;
  lat0 = this.lat0 || 0;
  lon = long0;
  if (Math.abs(rh) <= EPSLN) {
    lat = lat0;
    p.x = lon;
    p.y = lat;
    return p;
  }
  lat = asinz_default(cosz * this.sin_p14 + p.y * sinz * this.cos_p14 / rh);
  con = Math.abs(lat0) - HALF_PI;
  if (Math.abs(con) <= EPSLN) {
    if (lat0 >= 0) {
      lon = adjust_lon_default(long0 + Math.atan2(p.x, -p.y), this.over);
    } else {
      lon = adjust_lon_default(long0 - Math.atan2(-p.x, p.y), this.over);
    }
    p.x = lon;
    p.y = lat;
    return p;
  }
  lon = adjust_lon_default(long0 + Math.atan2(p.x * sinz, rh * this.cos_p14 * cosz - p.y * this.sin_p14 * sinz), this.over);
  p.x = lon;
  p.y = lat;
  return p;
}
var names29, ortho_default;
var init_ortho = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/ortho.js"() {
    init_adjust_lon();
    init_asinz();
    init_values();
    names29 = ["ortho"];
    ortho_default = {
      init: init28,
      forward: forward27,
      inverse: inverse27,
      names: names29
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/qsc.js
function init29() {
  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  this.lat0 = this.lat0 || 0;
  this.long0 = this.long0 || 0;
  this.lat_ts = this.lat_ts || 0;
  this.title = this.title || "Quadrilateralized Spherical Cube";
  if (this.lat0 >= HALF_PI - FORTPI / 2) {
    this.face = FACE_ENUM.TOP;
  } else if (this.lat0 <= -(HALF_PI - FORTPI / 2)) {
    this.face = FACE_ENUM.BOTTOM;
  } else if (Math.abs(this.long0) <= FORTPI) {
    this.face = FACE_ENUM.FRONT;
  } else if (Math.abs(this.long0) <= HALF_PI + FORTPI) {
    this.face = this.long0 > 0 ? FACE_ENUM.RIGHT : FACE_ENUM.LEFT;
  } else {
    this.face = FACE_ENUM.BACK;
  }
  if (this.es !== 0) {
    this.one_minus_f = 1 - (this.a - this.b) / this.a;
    this.one_minus_f_squared = this.one_minus_f * this.one_minus_f;
  }
}
function forward28(p) {
  var xy = { x: 0, y: 0 };
  var lat, lon;
  var theta, phi;
  var t, mu;
  var area = { value: 0 };
  p.x -= this.long0;
  if (this.es !== 0) {
    lat = Math.atan(this.one_minus_f_squared * Math.tan(p.y));
  } else {
    lat = p.y;
  }
  lon = p.x;
  if (this.face === FACE_ENUM.TOP) {
    phi = HALF_PI - lat;
    if (lon >= FORTPI && lon <= HALF_PI + FORTPI) {
      area.value = AREA_ENUM.AREA_0;
      theta = lon - HALF_PI;
    } else if (lon > HALF_PI + FORTPI || lon <= -(HALF_PI + FORTPI)) {
      area.value = AREA_ENUM.AREA_1;
      theta = lon > 0 ? lon - SPI : lon + SPI;
    } else if (lon > -(HALF_PI + FORTPI) && lon <= -FORTPI) {
      area.value = AREA_ENUM.AREA_2;
      theta = lon + HALF_PI;
    } else {
      area.value = AREA_ENUM.AREA_3;
      theta = lon;
    }
  } else if (this.face === FACE_ENUM.BOTTOM) {
    phi = HALF_PI + lat;
    if (lon >= FORTPI && lon <= HALF_PI + FORTPI) {
      area.value = AREA_ENUM.AREA_0;
      theta = -lon + HALF_PI;
    } else if (lon < FORTPI && lon >= -FORTPI) {
      area.value = AREA_ENUM.AREA_1;
      theta = -lon;
    } else if (lon < -FORTPI && lon >= -(HALF_PI + FORTPI)) {
      area.value = AREA_ENUM.AREA_2;
      theta = -lon - HALF_PI;
    } else {
      area.value = AREA_ENUM.AREA_3;
      theta = lon > 0 ? -lon + SPI : -lon - SPI;
    }
  } else {
    var q, r, s;
    var sinlat, coslat;
    var sinlon, coslon;
    if (this.face === FACE_ENUM.RIGHT) {
      lon = qsc_shift_lon_origin(lon, +HALF_PI);
    } else if (this.face === FACE_ENUM.BACK) {
      lon = qsc_shift_lon_origin(lon, +SPI);
    } else if (this.face === FACE_ENUM.LEFT) {
      lon = qsc_shift_lon_origin(lon, -HALF_PI);
    }
    sinlat = Math.sin(lat);
    coslat = Math.cos(lat);
    sinlon = Math.sin(lon);
    coslon = Math.cos(lon);
    q = coslat * coslon;
    r = coslat * sinlon;
    s = sinlat;
    if (this.face === FACE_ENUM.FRONT) {
      phi = Math.acos(q);
      theta = qsc_fwd_equat_face_theta(phi, s, r, area);
    } else if (this.face === FACE_ENUM.RIGHT) {
      phi = Math.acos(r);
      theta = qsc_fwd_equat_face_theta(phi, s, -q, area);
    } else if (this.face === FACE_ENUM.BACK) {
      phi = Math.acos(-q);
      theta = qsc_fwd_equat_face_theta(phi, s, -r, area);
    } else if (this.face === FACE_ENUM.LEFT) {
      phi = Math.acos(-r);
      theta = qsc_fwd_equat_face_theta(phi, s, q, area);
    } else {
      phi = theta = 0;
      area.value = AREA_ENUM.AREA_0;
    }
  }
  mu = Math.atan(12 / SPI * (theta + Math.acos(Math.sin(theta) * Math.cos(FORTPI)) - HALF_PI));
  t = Math.sqrt((1 - Math.cos(phi)) / (Math.cos(mu) * Math.cos(mu)) / (1 - Math.cos(Math.atan(1 / Math.cos(theta)))));
  if (area.value === AREA_ENUM.AREA_1) {
    mu += HALF_PI;
  } else if (area.value === AREA_ENUM.AREA_2) {
    mu += SPI;
  } else if (area.value === AREA_ENUM.AREA_3) {
    mu += 1.5 * SPI;
  }
  xy.x = t * Math.cos(mu);
  xy.y = t * Math.sin(mu);
  xy.x = xy.x * this.a + this.x0;
  xy.y = xy.y * this.a + this.y0;
  p.x = xy.x;
  p.y = xy.y;
  return p;
}
function inverse28(p) {
  var lp = { lam: 0, phi: 0 };
  var mu, nu, cosmu, tannu;
  var tantheta, theta, cosphi, phi;
  var t;
  var area = { value: 0 };
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;
  nu = Math.atan(Math.sqrt(p.x * p.x + p.y * p.y));
  mu = Math.atan2(p.y, p.x);
  if (p.x >= 0 && p.x >= Math.abs(p.y)) {
    area.value = AREA_ENUM.AREA_0;
  } else if (p.y >= 0 && p.y >= Math.abs(p.x)) {
    area.value = AREA_ENUM.AREA_1;
    mu -= HALF_PI;
  } else if (p.x < 0 && -p.x >= Math.abs(p.y)) {
    area.value = AREA_ENUM.AREA_2;
    mu = mu < 0 ? mu + SPI : mu - SPI;
  } else {
    area.value = AREA_ENUM.AREA_3;
    mu += HALF_PI;
  }
  t = SPI / 12 * Math.tan(mu);
  tantheta = Math.sin(t) / (Math.cos(t) - 1 / Math.sqrt(2));
  theta = Math.atan(tantheta);
  cosmu = Math.cos(mu);
  tannu = Math.tan(nu);
  cosphi = 1 - cosmu * cosmu * tannu * tannu * (1 - Math.cos(Math.atan(1 / Math.cos(theta))));
  if (cosphi < -1) {
    cosphi = -1;
  } else if (cosphi > 1) {
    cosphi = 1;
  }
  if (this.face === FACE_ENUM.TOP) {
    phi = Math.acos(cosphi);
    lp.phi = HALF_PI - phi;
    if (area.value === AREA_ENUM.AREA_0) {
      lp.lam = theta + HALF_PI;
    } else if (area.value === AREA_ENUM.AREA_1) {
      lp.lam = theta < 0 ? theta + SPI : theta - SPI;
    } else if (area.value === AREA_ENUM.AREA_2) {
      lp.lam = theta - HALF_PI;
    } else {
      lp.lam = theta;
    }
  } else if (this.face === FACE_ENUM.BOTTOM) {
    phi = Math.acos(cosphi);
    lp.phi = phi - HALF_PI;
    if (area.value === AREA_ENUM.AREA_0) {
      lp.lam = -theta + HALF_PI;
    } else if (area.value === AREA_ENUM.AREA_1) {
      lp.lam = -theta;
    } else if (area.value === AREA_ENUM.AREA_2) {
      lp.lam = -theta - HALF_PI;
    } else {
      lp.lam = theta < 0 ? -theta - SPI : -theta + SPI;
    }
  } else {
    var q, r, s;
    q = cosphi;
    t = q * q;
    if (t >= 1) {
      s = 0;
    } else {
      s = Math.sqrt(1 - t) * Math.sin(theta);
    }
    t += s * s;
    if (t >= 1) {
      r = 0;
    } else {
      r = Math.sqrt(1 - t);
    }
    if (area.value === AREA_ENUM.AREA_1) {
      t = r;
      r = -s;
      s = t;
    } else if (area.value === AREA_ENUM.AREA_2) {
      r = -r;
      s = -s;
    } else if (area.value === AREA_ENUM.AREA_3) {
      t = r;
      r = s;
      s = -t;
    }
    if (this.face === FACE_ENUM.RIGHT) {
      t = q;
      q = -r;
      r = t;
    } else if (this.face === FACE_ENUM.BACK) {
      q = -q;
      r = -r;
    } else if (this.face === FACE_ENUM.LEFT) {
      t = q;
      q = r;
      r = -t;
    }
    lp.phi = Math.acos(-s) - HALF_PI;
    lp.lam = Math.atan2(r, q);
    if (this.face === FACE_ENUM.RIGHT) {
      lp.lam = qsc_shift_lon_origin(lp.lam, -HALF_PI);
    } else if (this.face === FACE_ENUM.BACK) {
      lp.lam = qsc_shift_lon_origin(lp.lam, -SPI);
    } else if (this.face === FACE_ENUM.LEFT) {
      lp.lam = qsc_shift_lon_origin(lp.lam, +HALF_PI);
    }
  }
  if (this.es !== 0) {
    var invert_sign;
    var tanphi, xa;
    invert_sign = lp.phi < 0 ? 1 : 0;
    tanphi = Math.tan(lp.phi);
    xa = this.b / Math.sqrt(tanphi * tanphi + this.one_minus_f_squared);
    lp.phi = Math.atan(Math.sqrt(this.a * this.a - xa * xa) / (this.one_minus_f * xa));
    if (invert_sign) {
      lp.phi = -lp.phi;
    }
  }
  lp.lam += this.long0;
  p.x = lp.lam;
  p.y = lp.phi;
  return p;
}
function qsc_fwd_equat_face_theta(phi, y, x, area) {
  var theta;
  if (phi < EPSLN) {
    area.value = AREA_ENUM.AREA_0;
    theta = 0;
  } else {
    theta = Math.atan2(y, x);
    if (Math.abs(theta) <= FORTPI) {
      area.value = AREA_ENUM.AREA_0;
    } else if (theta > FORTPI && theta <= HALF_PI + FORTPI) {
      area.value = AREA_ENUM.AREA_1;
      theta -= HALF_PI;
    } else if (theta > HALF_PI + FORTPI || theta <= -(HALF_PI + FORTPI)) {
      area.value = AREA_ENUM.AREA_2;
      theta = theta >= 0 ? theta - SPI : theta + SPI;
    } else {
      area.value = AREA_ENUM.AREA_3;
      theta += HALF_PI;
    }
  }
  return theta;
}
function qsc_shift_lon_origin(lon, offset) {
  var slon = lon + offset;
  if (slon < -SPI) {
    slon += TWO_PI;
  } else if (slon > +SPI) {
    slon -= TWO_PI;
  }
  return slon;
}
var FACE_ENUM, AREA_ENUM, names30, qsc_default;
var init_qsc = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/qsc.js"() {
    init_values();
    FACE_ENUM = {
      FRONT: 1,
      RIGHT: 2,
      BACK: 3,
      LEFT: 4,
      TOP: 5,
      BOTTOM: 6
    };
    AREA_ENUM = {
      AREA_0: 1,
      AREA_1: 2,
      AREA_2: 3,
      AREA_3: 4
    };
    names30 = ["Quadrilateralized Spherical Cube", "Quadrilateralized_Spherical_Cube", "qsc"];
    qsc_default = {
      init: init29,
      forward: forward28,
      inverse: inverse28,
      names: names30
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/robin.js
function newton_rapshon(f_df, start2, max_err, iters) {
  var x = start2;
  for (; iters; --iters) {
    var upd = f_df(x);
    x -= upd;
    if (Math.abs(upd) < max_err) {
      break;
    }
  }
  return x;
}
function init30() {
  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  this.long0 = this.long0 || 0;
  this.es = 0;
  this.title = this.title || "Robinson";
}
function forward29(ll) {
  var lon = adjust_lon_default(ll.x - this.long0, this.over);
  var dphi = Math.abs(ll.y);
  var i = Math.floor(dphi * C1);
  if (i < 0) {
    i = 0;
  } else if (i >= NODES) {
    i = NODES - 1;
  }
  dphi = R2D * (dphi - RC1 * i);
  var xy = {
    x: poly3_val(COEFS_X[i], dphi) * lon,
    y: poly3_val(COEFS_Y[i], dphi)
  };
  if (ll.y < 0) {
    xy.y = -xy.y;
  }
  xy.x = xy.x * this.a * FXC + this.x0;
  xy.y = xy.y * this.a * FYC + this.y0;
  return xy;
}
function inverse29(xy) {
  var ll = {
    x: (xy.x - this.x0) / (this.a * FXC),
    y: Math.abs(xy.y - this.y0) / (this.a * FYC)
  };
  if (ll.y >= 1) {
    ll.x /= COEFS_X[NODES][0];
    ll.y = xy.y < 0 ? -HALF_PI : HALF_PI;
  } else {
    var i = Math.floor(ll.y * NODES);
    if (i < 0) {
      i = 0;
    } else if (i >= NODES) {
      i = NODES - 1;
    }
    for (; ; ) {
      if (COEFS_Y[i][0] > ll.y) {
        --i;
      } else if (COEFS_Y[i + 1][0] <= ll.y) {
        ++i;
      } else {
        break;
      }
    }
    var coefs = COEFS_Y[i];
    var t = 5 * (ll.y - coefs[0]) / (COEFS_Y[i + 1][0] - coefs[0]);
    t = newton_rapshon(function(x) {
      return (poly3_val(coefs, x) - ll.y) / poly3_der(coefs, x);
    }, t, EPSLN, 100);
    ll.x /= poly3_val(COEFS_X[i], t);
    ll.y = (5 * i + t) * D2R;
    if (xy.y < 0) {
      ll.y = -ll.y;
    }
  }
  ll.x = adjust_lon_default(ll.x + this.long0, this.over);
  return ll;
}
var COEFS_X, COEFS_Y, FXC, FYC, C1, RC1, NODES, poly3_val, poly3_der, names31, robin_default;
var init_robin = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/robin.js"() {
    init_values();
    init_adjust_lon();
    COEFS_X = [
      [1, 22199e-21, -715515e-10, 31103e-10],
      [0.9986, -482243e-9, -24897e-9, -13309e-10],
      [0.9954, -83103e-8, -448605e-10, -9.86701e-7],
      [0.99, -135364e-8, -59661e-9, 36777e-10],
      [0.9822, -167442e-8, -449547e-11, -572411e-11],
      [0.973, -214868e-8, -903571e-10, 18736e-12],
      [0.96, -305085e-8, -900761e-10, 164917e-11],
      [0.9427, -382792e-8, -653386e-10, -26154e-10],
      [0.9216, -467746e-8, -10457e-8, 481243e-11],
      [0.8962, -536223e-8, -323831e-10, -543432e-11],
      [0.8679, -609363e-8, -113898e-9, 332484e-11],
      [0.835, -698325e-8, -640253e-10, 934959e-12],
      [0.7986, -755338e-8, -500009e-10, 935324e-12],
      [0.7597, -798324e-8, -35971e-9, -227626e-11],
      [0.7186, -851367e-8, -701149e-10, -86303e-10],
      [0.6732, -986209e-8, -199569e-9, 191974e-10],
      [0.6213, -0.010418, 883923e-10, 624051e-11],
      [0.5722, -906601e-8, 182e-6, 624051e-11],
      [0.5322, -677797e-8, 275608e-9, 624051e-11]
    ];
    COEFS_Y = [
      [-520417e-23, 0.0124, 121431e-23, -845284e-16],
      [0.062, 0.0124, -1.26793e-9, 422642e-15],
      [0.124, 0.0124, 507171e-14, -1.60604e-9],
      [0.186, 0.0123999, -1.90189e-8, 600152e-14],
      [0.248, 0.0124002, 710039e-13, -2.24e-8],
      [0.31, 0.0123992, -2.64997e-7, 835986e-13],
      [0.372, 0.0124029, 988983e-12, -3.11994e-7],
      [0.434, 0.0123893, -369093e-11, -4.35621e-7],
      [0.4958, 0.0123198, -102252e-10, -3.45523e-7],
      [0.5571, 0.0121916, -154081e-10, -5.82288e-7],
      [0.6176, 0.0119938, -241424e-10, -5.25327e-7],
      [0.6769, 0.011713, -320223e-10, -5.16405e-7],
      [0.7346, 0.0113541, -397684e-10, -6.09052e-7],
      [0.7903, 0.0109107, -489042e-10, -104739e-11],
      [0.8435, 0.0103431, -64615e-9, -1.40374e-9],
      [0.8936, 969686e-8, -64636e-9, -8547e-9],
      [0.9394, 840947e-8, -192841e-9, -42106e-10],
      [0.9761, 616527e-8, -256e-6, -42106e-10],
      [1, 328947e-8, -319159e-9, -42106e-10]
    ];
    FXC = 0.8487;
    FYC = 1.3523;
    C1 = R2D / 5;
    RC1 = 1 / C1;
    NODES = 18;
    poly3_val = function(coefs, x) {
      return coefs[0] + x * (coefs[1] + x * (coefs[2] + x * coefs[3]));
    };
    poly3_der = function(coefs, x) {
      return coefs[1] + x * (2 * coefs[2] + x * 3 * coefs[3]);
    };
    names31 = ["Robinson", "robin"];
    robin_default = {
      init: init30,
      forward: forward29,
      inverse: inverse29,
      names: names31
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/geocent.js
function init31() {
  this.name = "geocent";
}
function forward30(p) {
  var point = geodeticToGeocentric(p, this.es, this.a);
  return point;
}
function inverse30(p) {
  var point = geocentricToGeodetic(p, this.es, this.a, this.b);
  return point;
}
var names32, geocent_default;
var init_geocent = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/geocent.js"() {
    init_datumUtils();
    names32 = ["Geocentric", "geocentric", "geocent", "Geocent"];
    geocent_default = {
      init: init31,
      forward: forward30,
      inverse: inverse30,
      names: names32
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/tpers.js
function init32() {
  Object.keys(params).forEach(function(p) {
    if (typeof this[p] === "undefined") {
      this[p] = params[p].def;
    } else if (params[p].num && isNaN(this[p])) {
      throw new Error("Invalid parameter value, must be numeric " + p + " = " + this[p]);
    } else if (params[p].num) {
      this[p] = parseFloat(this[p]);
    }
    if (params[p].degrees) {
      this[p] = this[p] * D2R;
    }
  }.bind(this));
  if (Math.abs(Math.abs(this.lat0) - HALF_PI) < EPSLN) {
    this.mode = this.lat0 < 0 ? mode.S_POLE : mode.N_POLE;
  } else if (Math.abs(this.lat0) < EPSLN) {
    this.mode = mode.EQUIT;
  } else {
    this.mode = mode.OBLIQ;
    this.sinph0 = Math.sin(this.lat0);
    this.cosph0 = Math.cos(this.lat0);
  }
  this.pn1 = this.h / this.a;
  if (this.pn1 <= 0 || this.pn1 > 1e10) {
    throw new Error("Invalid height");
  }
  this.p = 1 + this.pn1;
  this.rp = 1 / this.p;
  this.h1 = 1 / this.pn1;
  this.pfact = (this.p + 1) * this.h1;
  this.es = 0;
  var omega = this.tilt;
  var gamma = this.azi;
  this.cg = Math.cos(gamma);
  this.sg = Math.sin(gamma);
  this.cw = Math.cos(omega);
  this.sw = Math.sin(omega);
}
function forward31(p) {
  p.x -= this.long0;
  var sinphi = Math.sin(p.y);
  var cosphi = Math.cos(p.y);
  var coslam = Math.cos(p.x);
  var x, y;
  switch (this.mode) {
    case mode.OBLIQ:
      y = this.sinph0 * sinphi + this.cosph0 * cosphi * coslam;
      break;
    case mode.EQUIT:
      y = cosphi * coslam;
      break;
    case mode.S_POLE:
      y = -sinphi;
      break;
    case mode.N_POLE:
      y = sinphi;
      break;
  }
  y = this.pn1 / (this.p - y);
  x = y * cosphi * Math.sin(p.x);
  switch (this.mode) {
    case mode.OBLIQ:
      y *= this.cosph0 * sinphi - this.sinph0 * cosphi * coslam;
      break;
    case mode.EQUIT:
      y *= sinphi;
      break;
    case mode.N_POLE:
      y *= -(cosphi * coslam);
      break;
    case mode.S_POLE:
      y *= cosphi * coslam;
      break;
  }
  var yt, ba;
  yt = y * this.cg + x * this.sg;
  ba = 1 / (yt * this.sw * this.h1 + this.cw);
  x = (x * this.cg - y * this.sg) * this.cw * ba;
  y = yt * ba;
  p.x = x * this.a;
  p.y = y * this.a;
  return p;
}
function inverse31(p) {
  p.x /= this.a;
  p.y /= this.a;
  var r = { x: p.x, y: p.y };
  var bm, bq, yt;
  yt = 1 / (this.pn1 - p.y * this.sw);
  bm = this.pn1 * p.x * yt;
  bq = this.pn1 * p.y * this.cw * yt;
  p.x = bm * this.cg + bq * this.sg;
  p.y = bq * this.cg - bm * this.sg;
  var rh = hypot_default(p.x, p.y);
  if (Math.abs(rh) < EPSLN) {
    r.x = 0;
    r.y = p.y;
  } else {
    var cosz, sinz;
    sinz = 1 - rh * rh * this.pfact;
    sinz = (this.p - Math.sqrt(sinz)) / (this.pn1 / rh + rh / this.pn1);
    cosz = Math.sqrt(1 - sinz * sinz);
    switch (this.mode) {
      case mode.OBLIQ:
        r.y = Math.asin(cosz * this.sinph0 + p.y * sinz * this.cosph0 / rh);
        p.y = (cosz - this.sinph0 * Math.sin(r.y)) * rh;
        p.x *= sinz * this.cosph0;
        break;
      case mode.EQUIT:
        r.y = Math.asin(p.y * sinz / rh);
        p.y = cosz * rh;
        p.x *= sinz;
        break;
      case mode.N_POLE:
        r.y = Math.asin(cosz);
        p.y = -p.y;
        break;
      case mode.S_POLE:
        r.y = -Math.asin(cosz);
        break;
    }
    r.x = Math.atan2(p.x, p.y);
  }
  p.x = r.x + this.long0;
  p.y = r.y;
  return p;
}
var mode, params, names33, tpers_default;
var init_tpers = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/tpers.js"() {
    init_values();
    init_hypot();
    mode = {
      N_POLE: 0,
      S_POLE: 1,
      EQUIT: 2,
      OBLIQ: 3
    };
    params = {
      h: { def: 1e5, num: true },
      // default is Karman line, no default in PROJ.7
      azi: { def: 0, num: true, degrees: true },
      // default is North
      tilt: { def: 0, num: true, degrees: true },
      // default is Nadir
      long0: { def: 0, num: true },
      // default is Greenwich, conversion to rad is automatic
      lat0: { def: 0, num: true }
      // default is Equator, conversion to rad is automatic
    };
    names33 = ["Tilted_Perspective", "tpers"];
    tpers_default = {
      init: init32,
      forward: forward31,
      inverse: inverse31,
      names: names33
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/geos.js
function init33() {
  this.flip_axis = this.sweep === "x" ? 1 : 0;
  this.h = Number(this.h);
  this.radius_g_1 = this.h / this.a;
  if (this.radius_g_1 <= 0 || this.radius_g_1 > 1e10) {
    throw new Error();
  }
  this.radius_g = 1 + this.radius_g_1;
  this.C = this.radius_g * this.radius_g - 1;
  if (this.es !== 0) {
    var one_es = 1 - this.es;
    var rone_es = 1 / one_es;
    this.radius_p = Math.sqrt(one_es);
    this.radius_p2 = one_es;
    this.radius_p_inv2 = rone_es;
    this.shape = "ellipse";
  } else {
    this.radius_p = 1;
    this.radius_p2 = 1;
    this.radius_p_inv2 = 1;
    this.shape = "sphere";
  }
  if (!this.title) {
    this.title = "Geostationary Satellite View";
  }
}
function forward32(p) {
  var lon = p.x;
  var lat = p.y;
  var tmp, v_x, v_y, v_z;
  lon = lon - this.long0;
  if (this.shape === "ellipse") {
    lat = Math.atan(this.radius_p2 * Math.tan(lat));
    var r = this.radius_p / hypot_default(this.radius_p * Math.cos(lat), Math.sin(lat));
    v_x = r * Math.cos(lon) * Math.cos(lat);
    v_y = r * Math.sin(lon) * Math.cos(lat);
    v_z = r * Math.sin(lat);
    if ((this.radius_g - v_x) * v_x - v_y * v_y - v_z * v_z * this.radius_p_inv2 < 0) {
      p.x = Number.NaN;
      p.y = Number.NaN;
      return p;
    }
    tmp = this.radius_g - v_x;
    if (this.flip_axis) {
      p.x = this.radius_g_1 * Math.atan(v_y / hypot_default(v_z, tmp));
      p.y = this.radius_g_1 * Math.atan(v_z / tmp);
    } else {
      p.x = this.radius_g_1 * Math.atan(v_y / tmp);
      p.y = this.radius_g_1 * Math.atan(v_z / hypot_default(v_y, tmp));
    }
  } else if (this.shape === "sphere") {
    tmp = Math.cos(lat);
    v_x = Math.cos(lon) * tmp;
    v_y = Math.sin(lon) * tmp;
    v_z = Math.sin(lat);
    tmp = this.radius_g - v_x;
    if (this.flip_axis) {
      p.x = this.radius_g_1 * Math.atan(v_y / hypot_default(v_z, tmp));
      p.y = this.radius_g_1 * Math.atan(v_z / tmp);
    } else {
      p.x = this.radius_g_1 * Math.atan(v_y / tmp);
      p.y = this.radius_g_1 * Math.atan(v_z / hypot_default(v_y, tmp));
    }
  }
  p.x = p.x * this.a;
  p.y = p.y * this.a;
  return p;
}
function inverse32(p) {
  var v_x = -1;
  var v_y = 0;
  var v_z = 0;
  var a, b, det, k;
  p.x = p.x / this.a;
  p.y = p.y / this.a;
  if (this.shape === "ellipse") {
    if (this.flip_axis) {
      v_z = Math.tan(p.y / this.radius_g_1);
      v_y = Math.tan(p.x / this.radius_g_1) * hypot_default(1, v_z);
    } else {
      v_y = Math.tan(p.x / this.radius_g_1);
      v_z = Math.tan(p.y / this.radius_g_1) * hypot_default(1, v_y);
    }
    var v_zp = v_z / this.radius_p;
    a = v_y * v_y + v_zp * v_zp + v_x * v_x;
    b = 2 * this.radius_g * v_x;
    det = b * b - 4 * a * this.C;
    if (det < 0) {
      p.x = Number.NaN;
      p.y = Number.NaN;
      return p;
    }
    k = (-b - Math.sqrt(det)) / (2 * a);
    v_x = this.radius_g + k * v_x;
    v_y *= k;
    v_z *= k;
    p.x = Math.atan2(v_y, v_x);
    p.y = Math.atan(v_z * Math.cos(p.x) / v_x);
    p.y = Math.atan(this.radius_p_inv2 * Math.tan(p.y));
  } else if (this.shape === "sphere") {
    if (this.flip_axis) {
      v_z = Math.tan(p.y / this.radius_g_1);
      v_y = Math.tan(p.x / this.radius_g_1) * Math.sqrt(1 + v_z * v_z);
    } else {
      v_y = Math.tan(p.x / this.radius_g_1);
      v_z = Math.tan(p.y / this.radius_g_1) * Math.sqrt(1 + v_y * v_y);
    }
    a = v_y * v_y + v_z * v_z + v_x * v_x;
    b = 2 * this.radius_g * v_x;
    det = b * b - 4 * a * this.C;
    if (det < 0) {
      p.x = Number.NaN;
      p.y = Number.NaN;
      return p;
    }
    k = (-b - Math.sqrt(det)) / (2 * a);
    v_x = this.radius_g + k * v_x;
    v_y *= k;
    v_z *= k;
    p.x = Math.atan2(v_y, v_x);
    p.y = Math.atan(v_z * Math.cos(p.x) / v_x);
  }
  p.x = p.x + this.long0;
  return p;
}
var names34, geos_default;
var init_geos = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/geos.js"() {
    init_hypot();
    names34 = ["Geostationary Satellite View", "Geostationary_Satellite", "geos"];
    geos_default = {
      init: init33,
      forward: forward32,
      inverse: inverse32,
      names: names34
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/eqearth.js
function init34() {
  this.long0 = this.long0 !== void 0 ? this.long0 : 0;
  this.x0 = this.x0 !== void 0 ? this.x0 : 0;
  this.y0 = this.y0 !== void 0 ? this.y0 : 0;
  if (this.es !== 0) {
    this.apa = authset(this.es);
    this.qp = qsfnz_default(this.e, 1);
    this.rqda = Math.sqrt(0.5 * this.qp);
  }
}
function forward33(p) {
  var lam = adjust_lon_default(p.x - this.long0, this.over);
  var phi = p.y;
  var sinphi = Math.sin(phi);
  if (this.es !== 0) {
    sinphi = qsfnz_default(this.e, sinphi) / this.qp;
  }
  var paramLat = Math.asin(M * sinphi), paramLatSq = paramLat * paramLat, paramLatPow6 = paramLatSq * paramLatSq * paramLatSq;
  p.x = lam * Math.cos(paramLat) / (M * (A1 + 3 * A2 * paramLatSq + paramLatPow6 * (7 * A3 + 9 * A4 * paramLatSq)));
  p.y = paramLat * (A1 + A2 * paramLatSq + paramLatPow6 * (A3 + A4 * paramLatSq));
  if (this.es !== 0) {
    p.x *= this.rqda;
    p.y *= this.rqda;
  }
  p.x = this.a * p.x + this.x0;
  p.y = this.a * p.y + this.y0;
  return p;
}
function inverse33(p) {
  p.x = (p.x - this.x0) / this.a;
  p.y = (p.y - this.y0) / this.a;
  if (this.es !== 0) {
    p.x /= this.rqda;
    p.y /= this.rqda;
  }
  var EPS = 1e-9, NITER = 12, paramLat = p.y, paramLatSq, paramLatPow6, fy, fpy, dlat, i;
  for (i = 0; i < NITER; ++i) {
    paramLatSq = paramLat * paramLat;
    paramLatPow6 = paramLatSq * paramLatSq * paramLatSq;
    fy = paramLat * (A1 + A2 * paramLatSq + paramLatPow6 * (A3 + A4 * paramLatSq)) - p.y;
    fpy = A1 + 3 * A2 * paramLatSq + paramLatPow6 * (7 * A3 + 9 * A4 * paramLatSq);
    paramLat -= dlat = fy / fpy;
    if (Math.abs(dlat) < EPS) {
      break;
    }
  }
  paramLatSq = paramLat * paramLat;
  paramLatPow6 = paramLatSq * paramLatSq * paramLatSq;
  p.x = M * p.x * (A1 + 3 * A2 * paramLatSq + paramLatPow6 * (7 * A3 + 9 * A4 * paramLatSq)) / Math.cos(paramLat);
  p.y = Math.asin(Math.sin(paramLat) / M);
  if (this.es !== 0) {
    p.y = authlat(p.y, this.apa);
  }
  p.x = adjust_lon_default(p.x + this.long0, this.over);
  return p;
}
var A1, A2, A3, A4, M, names35, eqearth_default;
var init_eqearth = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/eqearth.js"() {
    init_adjust_lon();
    init_qsfnz();
    init_authset();
    init_authlat();
    A1 = 1.340264;
    A2 = -0.081106;
    A3 = 893e-6;
    A4 = 3796e-6;
    M = Math.sqrt(3) / 2;
    names35 = ["eqearth", "Equal Earth", "Equal_Earth"];
    eqearth_default = {
      init: init34,
      forward: forward33,
      inverse: inverse33,
      names: names35
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/bonne.js
function init35() {
  var c;
  this.phi1 = this.lat1;
  if (Math.abs(this.phi1) < EPS10) {
    throw new Error();
  }
  if (this.es) {
    this.en = pj_enfn_default(this.es);
    this.m1 = pj_mlfn_default(
      this.phi1,
      this.am1 = Math.sin(this.phi1),
      c = Math.cos(this.phi1),
      this.en
    );
    this.am1 = c / (Math.sqrt(1 - this.es * this.am1 * this.am1) * this.am1);
    this.inverse = e_inv;
    this.forward = e_fwd;
  } else {
    if (Math.abs(this.phi1) + EPS10 >= HALF_PI) {
      this.cphi1 = 0;
    } else {
      this.cphi1 = 1 / Math.tan(this.phi1);
    }
    this.inverse = s_inv;
    this.forward = s_fwd;
  }
}
function e_fwd(p) {
  var lam = adjust_lon_default(p.x - (this.long0 || 0), this.over);
  var phi = p.y;
  var rh, E, c;
  rh = this.am1 + this.m1 - pj_mlfn_default(phi, E = Math.sin(phi), c = Math.cos(phi), this.en);
  E = c * lam / (rh * Math.sqrt(1 - this.es * E * E));
  p.x = rh * Math.sin(E);
  p.y = this.am1 - rh * Math.cos(E);
  p.x = this.a * p.x + (this.x0 || 0);
  p.y = this.a * p.y + (this.y0 || 0);
  return p;
}
function e_inv(p) {
  p.x = (p.x - (this.x0 || 0)) / this.a;
  p.y = (p.y - (this.y0 || 0)) / this.a;
  var s, rh, lam, phi;
  rh = hypot_default(p.x, p.y = this.am1 - p.y);
  phi = pj_inv_mlfn_default(this.am1 + this.m1 - rh, this.es, this.en);
  if ((s = Math.abs(phi)) < HALF_PI) {
    s = Math.sin(phi);
    lam = rh * Math.atan2(p.x, p.y) * Math.sqrt(1 - this.es * s * s) / Math.cos(phi);
  } else if (Math.abs(s - HALF_PI) <= EPS10) {
    lam = 0;
  } else {
    throw new Error();
  }
  p.x = adjust_lon_default(lam + (this.long0 || 0), this.over);
  p.y = adjust_lat_default(phi);
  return p;
}
function s_fwd(p) {
  var lam = adjust_lon_default(p.x - (this.long0 || 0), this.over);
  var phi = p.y;
  var E, rh;
  rh = this.cphi1 + this.phi1 - phi;
  if (Math.abs(rh) > EPS10) {
    p.x = rh * Math.sin(E = lam * Math.cos(phi) / rh);
    p.y = this.cphi1 - rh * Math.cos(E);
  } else {
    p.x = p.y = 0;
  }
  p.x = this.a * p.x + (this.x0 || 0);
  p.y = this.a * p.y + (this.y0 || 0);
  return p;
}
function s_inv(p) {
  p.x = (p.x - (this.x0 || 0)) / this.a;
  p.y = (p.y - (this.y0 || 0)) / this.a;
  var lam, phi;
  var rh = hypot_default(p.x, p.y = this.cphi1 - p.y);
  phi = this.cphi1 + this.phi1 - rh;
  if (Math.abs(phi) > HALF_PI) {
    throw new Error();
  }
  if (Math.abs(Math.abs(phi) - HALF_PI) <= EPS10) {
    lam = 0;
  } else {
    lam = rh * Math.atan2(p.x, p.y) / Math.cos(phi);
  }
  p.x = adjust_lon_default(lam + (this.long0 || 0), this.over);
  p.y = adjust_lat_default(phi);
  return p;
}
var EPS10, names36, bonne_default;
var init_bonne = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/bonne.js"() {
    init_adjust_lat();
    init_adjust_lon();
    init_hypot();
    init_pj_enfn();
    init_pj_inv_mlfn();
    init_pj_mlfn();
    init_values();
    EPS10 = 1e-10;
    names36 = ["bonne", "Bonne (Werner lat_1=90)"];
    bonne_default = {
      init: init35,
      names: names36
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/ob_tran.js
function init36() {
  this.x0 = this.x0 || 0;
  this.y0 = this.y0 || 0;
  this.long0 = this.long0 || 0;
  this.title = this.title || "General Oblique Transformation";
  this.isIdentity = names2.includes(this.o_proj);
  if (!this.o_proj) {
    throw new Error("Missing parameter: o_proj");
  }
  if (this.o_proj === `ob_tran`) {
    throw new Error("Invalid value for o_proj: " + this.o_proj);
  }
  const newProjStr = this.projStr.replace("+proj=ob_tran", "").replace("+o_proj=", "+proj=").trim();
  const oProj = Proj_default(newProjStr);
  if (!oProj) {
    throw new Error("Invalid parameter: o_proj. Unknown projection " + this.o_proj);
  }
  oProj.long0 = 0;
  this.obliqueProjection = oProj;
  let matchedSet;
  const paramSetsKeys = Object.keys(paramSets);
  const parseParam = (name) => {
    if (typeof this[name] === `undefined`) {
      return void 0;
    }
    const val = parseFloat(this[name]) * D2R;
    if (isNaN(val)) {
      throw new Error("Invalid value for " + name + ": " + this[name]);
    }
    return val;
  };
  for (let i = 0; i < paramSetsKeys.length; i++) {
    const setKey = paramSetsKeys[i];
    const set = paramSets[setKey];
    const params2 = Object.entries(set);
    const setHasParams = params2.some(
      ([p]) => typeof this[p] !== "undefined"
    );
    if (!setHasParams) {
      continue;
    }
    matchedSet = set;
    for (let ii = 0; ii < params2.length; ii++) {
      const [inputParam, param] = params2[ii];
      const val = parseParam(inputParam);
      if (typeof val === "undefined") {
        throw new Error("Missing parameter: " + inputParam + ".");
      }
      this[param] = val;
    }
    break;
  }
  if (!matchedSet) {
    throw new Error("No valid parameters provided for ob_tran projection.");
  }
  const { lamp, phip } = createRotation(this, matchedSet);
  this.lamp = lamp;
  if (Math.abs(phip) > EPSLN) {
    this.cphip = Math.cos(phip);
    this.sphip = Math.sin(phip);
    this.projectionType = projectionType.OBLIQUE;
  } else {
    this.projectionType = projectionType.TRANSVERSE;
  }
}
function forward34(p) {
  return this.projectionType.forward(this, p);
}
function inverse34(p) {
  return this.projectionType.inverse(this, p);
}
function createRotation(params2, how) {
  let phip, lamp;
  if (how === paramSets.ROTATE) {
    let lamc = params2.oLongC;
    let phic = params2.oLatC;
    let alpha = params2.oAlpha;
    if (Math.abs(Math.abs(phic) - HALF_PI) <= EPSLN) {
      throw new Error("Invalid value for o_lat_c: " + params2.o_lat_c + " should be < 90\xB0");
    }
    lamp = lamc + Math.atan2(-1 * Math.cos(alpha), -1 * Math.sin(alpha) * Math.sin(phic));
    phip = Math.asin(Math.cos(phic) * Math.sin(alpha));
  } else if (how === paramSets.NEW_POLE) {
    lamp = params2.oLongP;
    phip = params2.oLatP;
  } else {
    let lam1 = params2.oLong1;
    let phi1 = params2.oLat1;
    let lam2 = params2.oLong2;
    let phi2 = params2.oLat2;
    let con = Math.abs(phi1);
    if (Math.abs(phi1) > HALF_PI - EPSLN) {
      throw new Error("Invalid value for o_lat_1: " + params2.o_lat_1 + " should be < 90\xB0");
    }
    if (Math.abs(phi2) > HALF_PI - EPSLN) {
      throw new Error("Invalid value for o_lat_2: " + params2.o_lat_2 + " should be < 90\xB0");
    }
    if (Math.abs(phi1 - phi2) < EPSLN) {
      throw new Error("Invalid value for o_lat_1 and o_lat_2: o_lat_1 should be different from o_lat_2");
    }
    if (con < EPSLN) {
      throw new Error("Invalid value for o_lat_1: o_lat_1 should be different from zero");
    }
    lamp = Math.atan2(
      Math.cos(phi1) * Math.sin(phi2) * Math.cos(lam1) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(lam2),
      Math.sin(phi1) * Math.cos(phi2) * Math.sin(lam2) - Math.cos(phi1) * Math.sin(phi2) * Math.sin(lam1)
    );
    phip = Math.atan(-1 * Math.cos(lamp - lam1) / Math.tan(phi1));
  }
  return { lamp, phip };
}
function forwardOblique(self, lp) {
  let { x: lam, y: phi } = lp;
  lam = adjust_lon_default(lam - self.long0, self.over);
  const coslam = Math.cos(lam);
  const sinphi = Math.sin(phi);
  const cosphi = Math.cos(phi);
  lp.x = adjust_lon_default(
    Math.atan2(
      cosphi * Math.sin(lam),
      self.sphip * cosphi * coslam + self.cphip * sinphi
    ) + self.lamp
  );
  lp.y = Math.asin(
    self.sphip * sinphi - self.cphip * cosphi * coslam
  );
  const result = self.obliqueProjection.forward(lp);
  if (self.isIdentity) {
    result.x *= R2D;
    result.y *= R2D;
  }
  return result;
}
function forwardTransverse(self, lp) {
  let { x: lam, y: phi } = lp;
  lam = adjust_lon_default(lam - self.long0, self.over);
  const cosphi = Math.cos(phi);
  const coslam = Math.cos(lam);
  lp.x = adjust_lon_default(
    Math.atan2(
      cosphi * Math.sin(lam),
      Math.sin(phi)
    ) + self.lamp
  );
  lp.y = Math.asin(-1 * cosphi * coslam);
  const result = self.obliqueProjection.forward(lp);
  if (self.isIdentity) {
    result.x *= R2D;
    result.y *= R2D;
  }
  return result;
}
function inverseOblique(self, lp) {
  if (self.isIdentity) {
    lp.x *= D2R;
    lp.y *= D2R;
  }
  const innerLp = self.obliqueProjection.inverse(lp);
  let { x: lam, y: phi } = innerLp;
  if (lam < Number.MAX_VALUE) {
    lam -= self.lamp;
    const coslam = Math.cos(lam);
    const sinphi = Math.sin(phi);
    const cosphi = Math.cos(phi);
    lp.x = Math.atan2(
      cosphi * Math.sin(lam),
      self.sphip * cosphi * coslam - self.cphip * sinphi
    );
    lp.y = Math.asin(
      self.sphip * sinphi + self.cphip * cosphi * coslam
    );
  }
  lp.x = adjust_lon_default(lp.x + self.long0);
  return lp;
}
function inverseTransverse(self, lp) {
  if (self.isIdentity) {
    lp.x *= D2R;
    lp.y *= D2R;
  }
  const innerLp = self.obliqueProjection.inverse(lp);
  let { x: lam, y: phi } = innerLp;
  if (lam < Number.MAX_VALUE) {
    const cosphi = Math.cos(phi);
    lam -= self.lamp;
    lp.x = Math.atan2(
      cosphi * Math.sin(lam),
      -1 * Math.sin(phi)
    );
    lp.y = Math.asin(
      cosphi * Math.cos(lam)
    );
  }
  lp.x = adjust_lon_default(lp.x + self.long0);
  return lp;
}
var projectionType, paramSets, names37, ob_tran_default;
var init_ob_tran = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/projections/ob_tran.js"() {
    init_adjust_lon();
    init_values();
    init_Proj();
    init_longlat();
    projectionType = {
      OBLIQUE: {
        forward: forwardOblique,
        inverse: inverseOblique
      },
      TRANSVERSE: {
        forward: forwardTransverse,
        inverse: inverseTransverse
      }
    };
    paramSets = {
      ROTATE: {
        o_alpha: "oAlpha",
        o_lon_c: "oLongC",
        o_lat_c: "oLatC"
      },
      NEW_POLE: {
        o_lat_p: "oLatP",
        o_lon_p: "oLongP"
      },
      NEW_EQUATOR: {
        o_lon_1: "oLong1",
        o_lat_1: "oLat1",
        o_lon_2: "oLong2",
        o_lat_2: "oLat2"
      }
    };
    names37 = ["General Oblique Transformation", "General_Oblique_Transformation", "ob_tran"];
    ob_tran_default = {
      init: init36,
      forward: forward34,
      inverse: inverse34,
      names: names37
    };
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/projs.js
function projs_default(proj43) {
  proj43.Proj.projections.add(tmerc_default);
  proj43.Proj.projections.add(etmerc_default);
  proj43.Proj.projections.add(utm_default);
  proj43.Proj.projections.add(sterea_default);
  proj43.Proj.projections.add(stere_default);
  proj43.Proj.projections.add(somerc_default);
  proj43.Proj.projections.add(omerc_default);
  proj43.Proj.projections.add(lcc_default);
  proj43.Proj.projections.add(krovak_default);
  proj43.Proj.projections.add(cass_default);
  proj43.Proj.projections.add(laea_default);
  proj43.Proj.projections.add(aea_default);
  proj43.Proj.projections.add(gnom_default);
  proj43.Proj.projections.add(cea_default);
  proj43.Proj.projections.add(eqc_default);
  proj43.Proj.projections.add(poly_default);
  proj43.Proj.projections.add(nzmg_default);
  proj43.Proj.projections.add(mill_default);
  proj43.Proj.projections.add(sinu_default);
  proj43.Proj.projections.add(eck6_default);
  proj43.Proj.projections.add(moll_default);
  proj43.Proj.projections.add(eqdc_default);
  proj43.Proj.projections.add(vandg_default);
  proj43.Proj.projections.add(aeqd_default);
  proj43.Proj.projections.add(ortho_default);
  proj43.Proj.projections.add(qsc_default);
  proj43.Proj.projections.add(robin_default);
  proj43.Proj.projections.add(geocent_default);
  proj43.Proj.projections.add(tpers_default);
  proj43.Proj.projections.add(geos_default);
  proj43.Proj.projections.add(eqearth_default);
  proj43.Proj.projections.add(bonne_default);
  proj43.Proj.projections.add(ob_tran_default);
}
var init_projs = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/projs.js"() {
    init_tmerc();
    init_etmerc();
    init_utm();
    init_sterea();
    init_stere();
    init_somerc();
    init_omerc();
    init_lcc();
    init_krovak();
    init_cass();
    init_laea();
    init_aea();
    init_gnom();
    init_cea();
    init_eqc();
    init_poly();
    init_nzmg();
    init_mill();
    init_sinu();
    init_eck6();
    init_moll();
    init_eqdc();
    init_vandg();
    init_aeqd();
    init_ortho();
    init_qsc();
    init_robin();
    init_geocent();
    init_tpers();
    init_geos();
    init_eqearth();
    init_bonne();
    init_ob_tran();
  }
});

// ../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/index.js
var lib_exports = {};
__export(lib_exports, {
  default: () => lib_default
});
var proj42, lib_default;
var init_lib = __esm({
  "../../node_modules/.pnpm/proj4@2.20.9/node_modules/proj4/lib/index.js"() {
    init_core();
    init_Proj();
    init_Point();
    init_toPoint();
    init_defs();
    init_nadgrid();
    init_transform();
    init_mgrs();
    init_projs();
    proj42 = Object.assign(core_default, {
      defaultDatum: "WGS84",
      Proj: Proj_default,
      WGS84: new Proj_default("WGS84"),
      Point: Point_default,
      toPoint: toPoint_default,
      defs: defs_default,
      nadgrid,
      transform,
      mgrs: mgrs_default,
      version: "__VERSION__"
    });
    projs_default(proj42);
    lib_default = proj42;
  }
});
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}
function formatLength(meters) {
  return `${meters.toFixed(2)} m`;
}
function formatArea(m2) {
  return `${m2.toFixed(2)} m\xB2`;
}
function formatVolume(m3) {
  return `${m3.toFixed(2)} m\xB3`;
}
function formatAngle(radians) {
  return `${(radians * 180 / Math.PI).toFixed(1)}\xB0`;
}
function formatCoord(x, y, z, decimals = 2) {
  const f = (v) => v.toFixed(decimals);
  return `X: ${f(x)}, Y: ${f(y)}, Z: ${f(z)}`;
}
function measurementUnit(type) {
  switch (type) {
    case "distance":
    case "height":
      return "m";
    case "area":
      return "m\xB2";
    case "volume":
      return "m\xB3";
    case "angle":
      return "\xB0";
    default:
      return "";
  }
}
function rawValue(m) {
  if (m.value === void 0) return "";
  switch (m.type) {
    case "distance":
    case "height":
      return m.value.toFixed(4);
    case "area":
      return m.value.toFixed(4);
    case "volume":
      return m.value.toFixed(4);
    case "angle":
      return (m.value * 180 / Math.PI).toFixed(2);
    case "point":
      return "";
    default:
      return m.value.toFixed(4);
  }
}
function csvField(val) {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
function exportMeasurementsCSV(measurements) {
  const maxPoints = measurements.reduce((max, m) => Math.max(max, m.points.length), 0);
  const header = ["#", "Type", "Label", "Value", "Unit"];
  for (let i = 1; i <= maxPoints; i++) {
    header.push(`Point ${i} X`, `Point ${i} Y`, `Point ${i} Z`);
  }
  const rows = [header.join(",")];
  measurements.forEach((m, idx) => {
    const fields = [
      String(idx + 1),
      csvField(m.type),
      csvField(m.label),
      rawValue(m),
      measurementUnit(m.type)
    ];
    for (let i = 0; i < maxPoints; i++) {
      const p = m.points[i];
      if (p) {
        fields.push(p.x.toFixed(4), p.y.toFixed(4), p.z.toFixed(4));
      } else {
        fields.push("", "", "");
      }
    }
    rows.push(fields.join(","));
  });
  return rows.join("\n");
}
function nextId() {
  return `m-${++_idCounter}`;
}
function lonToTileX(lon, z) {
  return Math.floor((lon + 180) / 360 * 2 ** z);
}
function latToTileY(lat, z) {
  const r = lat * Math.PI / 180;
  return Math.floor((1 - Math.asinh(Math.tan(r)) / Math.PI) / 2 * 2 ** z);
}
function tileXToLon(x, z) {
  return x / 2 ** z * 360 - 180;
}
function tileYToLat(y, z) {
  const n = Math.PI - 2 * Math.PI * y / 2 ** z;
  return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}
function cornersXY(b) {
  return [
    [b.min.x, b.min.y],
    [b.min.x, b.max.y],
    [b.max.x, b.min.y],
    [b.max.x, b.max.y]
  ];
}
function resolveCrsDef(crs) {
  const s = crs.trim();
  if (s.includes("+proj")) return s;
  return EPSG_DEFS[s.toUpperCase().replace(/\s+/g, "")] ?? null;
}
function genId() {
  return `clip_${_nextId++}`;
}
function genSceneId() {
  return `scene_${Date.now()}_${_nextId2++}`;
}
function captureScene(name, cameraPos, cameraTarget, clipBoxes, colorMode, pointSize, pointBudget) {
  return {
    name,
    camera: {
      position: [cameraPos.x, cameraPos.y, cameraPos.z],
      target: [cameraTarget.x, cameraTarget.y, cameraTarget.z]
    },
    clipBoxes: clipBoxes.map((b) => ({
      name: b.name,
      min: [b.box.min.x, b.box.min.y, b.box.min.z],
      max: [b.box.max.x, b.box.max.y, b.box.max.z],
      mode: b.mode,
      visible: b.visible
    })),
    colorMode,
    pointSize,
    pointBudget
  };
}
function createAdapter(source) {
  switch (source.type) {
    case "s3":
      return new S3SourceAdapter(source.baseUrl, source.headers);
    case "electron":
      return new ElectronSourceAdapter(source.basePath);
    case "local":
      return new S3SourceAdapter(source.basePath);
  }
}
var SceneManager, PointCloudLoader, CameraAnimator, DISPLAY_PRESETS, MARKER_COLOR_DEFAULT, MARKER_COLOR_HOVER, MARKER_COLOR_SELECTED, PIN_BASE_SCALE, MarkerManager, _idCounter, COLORS, MeasurementManager, VIEW_DIRECTIONS, ExportManager, MinimapRenderer, DEFAULT_TILE_URL, DEFAULT_ATTRIBUTION, EARTH_RADIUS, EARTH_CIRC, EPSG_DEFS, TileBasemapManager, AXIS_COLOR, HANDLE_HOVER_COLOR, HANDLE_DRAG_COLOR, FaceHandleController, _nextId, ClipManager, AxisWidget, MAX_SCENES, _nextId2, PresentationManager, S3SourceAdapter, ElectronSourceAdapter;
var init_dist = __esm({
  "../core/dist/index.js"() {
    SceneManager = class {
      scene;
      camera;
      renderer;
      controls;
      _navMode = "orbit";
      _projection = "perspective";
      _orthoCamera = null;
      /** Kept for API compatibility — no longer drives navigation */
      flySpeed = 10;
      animationId = null;
      lastTime = 0;
      frameCount = 0;
      fpsInterval = 0;
      onFpsUpdate;
      onPointsUpdate;
      resizeObserver;
      frameCallbacks = [];
      postRenderCallbacks = [];
      // potree-core Potree instance (set after lazy import)
      potree = null;
      pointClouds = [];
      constructor({ canvas, onFpsUpdate, onPointsUpdate }) {
        this.onFpsUpdate = onFpsUpdate;
        this.onPointsUpdate = onPointsUpdate;
        this.scene = new THREE5.Scene();
        this.scene.background = new THREE5.Color(657930);
        const { clientWidth: w, clientHeight: h } = canvas;
        this.camera = new THREE5.PerspectiveCamera(60, w / h, 0.01, 1e5);
        this.camera.up.set(0, 0, 1);
        this.camera.position.set(0, -50, 30);
        this.renderer = new THREE5.WebGLRenderer({
          antialias: true,
          logarithmicDepthBuffer: true,
          // Keep the drawing buffer so the picking magnifier (a 2D loupe) can sample
          // the rendered canvas between frames via drawImage.
          preserveDrawingBuffer: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this.renderer.setSize(w, h);
        this.renderer.outputColorSpace = THREE5.LinearSRGBColorSpace;
        this.renderer.autoClear = false;
        canvas.appendChild(this.renderer.domElement);
        this.renderer.domElement.style.touchAction = "none";
        this.renderer.domElement.style.userSelect = "none";
        this.renderer.domElement.addEventListener("dragstart", (e) => e.preventDefault());
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.screenSpacePanning = true;
        this.controls.minPolarAngle = 0.01;
        this.controls.maxPolarAngle = Math.PI - 0.01;
        this.controls.zoomSpeed = 1.5;
        this.controls.rotateSpeed = 0.8;
        this.controls.zoomToCursor = false;
        this.controls.mouseButtons = {
          LEFT: THREE5.MOUSE.ROTATE,
          MIDDLE: THREE5.MOUSE.DOLLY,
          RIGHT: THREE5.MOUSE.PAN
        };
        this.scene.add(new THREE5.AmbientLight(16777215, 0.5));
        const dir = new THREE5.DirectionalLight(16777215, 1);
        dir.position.set(1, 2, 3);
        this.scene.add(dir);
        this.resizeObserver = new ResizeObserver(() => this.onResize(canvas));
        this.resizeObserver.observe(canvas);
        this.fpsInterval = performance.now();
      }
      onResize(canvas) {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
      /** Start the render loop */
      start() {
        const loop = (now) => {
          this.animationId = requestAnimationFrame(loop);
          this.lastTime === 0 ? 16 : now - this.lastTime;
          this.lastTime = now;
          this.renderer.setScissorTest(false);
          this.renderer.clear();
          this.controls.update();
          if (this.potree && this.pointClouds.length > 0) {
            this.potree.updatePointClouds(
              this.pointClouds,
              this.camera,
              this.renderer
            );
          }
          this.frameCallbacks.forEach((cb) => cb());
          if (this._projection === "orthographic") {
            this.renderer.render(this.scene, this._syncOrthoCamera());
          } else {
            this.renderer.render(this.scene, this.camera);
          }
          this.renderer.setScissorTest(false);
          this.postRenderCallbacks.forEach((cb) => cb());
          this.frameCount++;
          if (now - this.fpsInterval >= 1e3) {
            this.onFpsUpdate?.(this.frameCount);
            this.frameCount = 0;
            this.fpsInterval = now;
          }
        };
        this.animationId = requestAnimationFrame(loop);
      }
      /** Register a callback run every frame before render */
      addFrameCallback(cb) {
        this.frameCallbacks.push(cb);
      }
      /** Remove a previously registered pre-render frame callback */
      removeFrameCallback(cb) {
        this.frameCallbacks = this.frameCallbacks.filter((fn) => fn !== cb);
      }
      /** Register a callback run every frame AFTER the main render (for overlays) */
      addPostRenderCallback(cb) {
        this.postRenderCallbacks.push(cb);
      }
      /** Remove a previously registered post-render callback */
      removePostRenderCallback(cb) {
        this.postRenderCallbacks = this.postRenderCallbacks.filter((fn) => fn !== cb);
      }
      /** Current navigation mode */
      get navigationMode() {
        return this._navMode;
      }
      /** Current camera projection */
      get projection() {
        return this._projection;
      }
      /**
       * Switch between perspective and orthographic projection.
       * PerspectiveCamera always drives OrbitControls and potree LOD — the ortho
       * camera is synced from it each frame and used only for rendering.
       */
      setProjection(mode2) {
        if (mode2 === this._projection) return;
        this._projection = mode2;
        if (mode2 === "orthographic" && !this._orthoCamera) {
          this._orthoCamera = new THREE5.OrthographicCamera(-1, 1, 1, -1, 0.01, 1e5);
        }
      }
      /**
       * Sync the ortho camera to the perspective camera's view each frame.
       * Frustum is derived from the perspective camera's FOV and current distance
       * to the orbit target so the visual scale matches.
       */
      _syncOrthoCamera() {
        const cam = this._orthoCamera;
        cam.position.copy(this.camera.position);
        cam.quaternion.copy(this.camera.quaternion);
        const dist = this.camera.position.distanceTo(this.controls.target);
        const h = 2 * dist * Math.tan(THREE5.MathUtils.degToRad(this.camera.fov / 2));
        const w = h * this.camera.aspect;
        cam.left = -w / 2;
        cam.right = w / 2;
        cam.top = h / 2;
        cam.bottom = -h / 2;
        cam.near = 0.01;
        cam.far = 1e5;
        cam.updateProjectionMatrix();
        return cam;
      }
      /**
       * Switch between navigation modes. All three reconfigure the SAME OrbitControls
       * instance (zoom-to-cursor + damping throughout) so the orbit target remains
       * authoritative for clipping, minimap, camera animation and ortho sync.
       * - orbit: CAD turntable — left-drag rotate, middle dolly, right pan, full sphere.
       * - free:  Blender-ish free orbit — left/middle drag rotate, right pan, full sphere.
       * - pan:   Map / top-down — left-drag pans, horizon-locked, right-drag rotates.
       */
      setNavigationMode(mode2) {
        if (mode2 === this._navMode) return;
        this._navMode = mode2;
        const c = this.controls;
        c.enabled = true;
        c.enableRotate = true;
        c.screenSpacePanning = true;
        if (mode2 === "pan") {
          c.minPolarAngle = 0.01;
          c.maxPolarAngle = Math.PI / 2.05;
          c.mouseButtons = {
            LEFT: THREE5.MOUSE.PAN,
            MIDDLE: THREE5.MOUSE.DOLLY,
            RIGHT: THREE5.MOUSE.ROTATE
          };
        } else if (mode2 === "free") {
          c.minPolarAngle = 0.01;
          c.maxPolarAngle = Math.PI - 0.01;
          c.mouseButtons = {
            LEFT: THREE5.MOUSE.ROTATE,
            MIDDLE: THREE5.MOUSE.ROTATE,
            RIGHT: THREE5.MOUSE.PAN
          };
        } else {
          c.minPolarAngle = 0.01;
          c.maxPolarAngle = Math.PI - 0.01;
          c.mouseButtons = {
            LEFT: THREE5.MOUSE.ROTATE,
            MIDDLE: THREE5.MOUSE.DOLLY,
            RIGHT: THREE5.MOUSE.PAN
          };
        }
        c.update();
      }
      /**
       * Set fly movement speed. Kept for API compatibility.
       */
      setFlySpeed(speed) {
        this.flySpeed = speed;
      }
      /** Stop animation loop and dispose resources */
      dispose() {
        if (this.animationId !== null) cancelAnimationFrame(this.animationId);
        this.resizeObserver.disconnect();
        this.controls.dispose();
        this.renderer.dispose();
        this.renderer.domElement.remove();
      }
      /** Fit camera to bounding box */
      fitToBox(box) {
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        box.getCenter(center);
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = this.camera.fov * (Math.PI / 180);
        const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
        const dir = new THREE5.Vector3(0, -0.82, 0.57).multiplyScalar(dist);
        this.camera.position.copy(center).add(dir);
        this.controls.target.copy(center);
        this.controls.update();
      }
      /** Raycast against objects in scene */
      raycast(normalizedX, normalizedY, objects) {
        const raycaster = new THREE5.Raycaster();
        const pointer = new THREE5.Vector2(normalizedX, normalizedY);
        raycaster.setFromCamera(pointer, this.camera);
        return raycaster.intersectObjects(objects, true);
      }
      /**
       * Pick a point on the point cloud using potree-core's GPU picker.
       * Returns the world-space position of the closest point under the cursor,
       * or null if nothing was hit.
       */
      pickPoint(normalizedX, normalizedY) {
        if (this.pointClouds.length === 0) return null;
        const raycaster = new THREE5.Raycaster();
        raycaster.setFromCamera(new THREE5.Vector2(normalizedX, normalizedY), this.camera);
        for (const pc of this.pointClouds) {
          const octree = pc;
          if (typeof octree.pick !== "function") continue;
          const result = octree.pick(this.renderer, this.camera, raycaster.ray, {
            pickWindowSize: 17
          });
          if (result?.position) {
            return result.position.clone();
          }
        }
        return null;
      }
    };
    PointCloudLoader = class {
      sceneManager;
      adapter;
      currentClouds = [];
      hasRgb = false;
      /** CRS string from metadata.json (empty = not georeferenced). */
      _projection = "";
      /** World-space bounding box of the loaded point cloud (available after load) */
      worldBox = new THREE5.Box3();
      constructor(sceneManager, adapter) {
        this.sceneManager = sceneManager;
        this.adapter = adapter;
      }
      /** Load a point cloud from the adapter's base URL */
      async load(metadataPath = "metadata.json", pointBudget = 2e6) {
        const { Potree, PointColorType } = await import('potree-core');
        if (!this.sceneManager.potree) {
          this.sceneManager.potree = new Potree();
        }
        this.clear();
        const requestManager = {
          fetch: (input, init37) => this.adapter.fetchWithHeaders ? this.adapter.fetchWithHeaders(input, init37) : fetch(input, init37),
          getUrl: (url) => Promise.resolve(this.adapter.resolveUrl(url))
        };
        const potree = this.sceneManager.potree;
        potree.pointBudget = pointBudget;
        const pointCloud = await potree.loadPointCloud(
          metadataPath,
          requestManager
        );
        pointCloud.material.size = 1.5;
        pointCloud.material.pointSizeType = 2;
        pointCloud.material.shape = 1;
        let hasRgb = false;
        try {
          const meta = await this.adapter.fetchJson(metadataPath);
          const attributes = meta?.attributes ?? [];
          hasRgb = attributes.some((a) => {
            const n = (a.name ?? "").toLowerCase();
            return n === "rgb" || n === "rgba" || n === "color";
          });
          this._projection = typeof meta?.projection === "string" ? meta.projection.trim() : "";
        } catch {
          hasRgb = false;
        }
        this.hasRgb = hasRgb;
        if (hasRgb) {
          pointCloud.material.pointColorType = PointColorType.RGB;
        } else {
          pointCloud.material.newFormat = false;
          pointCloud.material.pointColorType = PointColorType.HEIGHT;
        }
        pointCloud.material.outputColorEncoding = 1;
        pointCloud.material.needsUpdate = true;
        this.sceneManager.scene.add(pointCloud);
        this.sceneManager.pointClouds.push(pointCloud);
        this.currentClouds.push(pointCloud);
        const box = pointCloud.pcoGeometry?.boundingBox ?? pointCloud.boundingBox;
        const tightBox = pointCloud.pcoGeometry?.tightBoundingBox ?? box;
        const offset = pointCloud.pcoGeometry?.offset;
        const worldBox = new THREE5.Box3();
        if (tightBox && offset) {
          worldBox.copy(tightBox);
          worldBox.min.add(offset);
          worldBox.max.add(offset);
        } else if (box) {
          worldBox.copy(box);
        } else {
          worldBox.setFromObject(pointCloud);
        }
        this.worldBox = worldBox.clone();
        if (!worldBox.isEmpty()) {
          this.sceneManager.fitToBox(worldBox);
          const zMin = worldBox.min.z;
          const zMax = worldBox.max.z;
          const mat = pointCloud.material;
          if (mat) {
            mat.heightMin = zMin;
            mat.heightMax = zMax;
            mat.rgbGamma = 1;
            mat.rgbBrightness = 0;
            mat.rgbContrast = 0;
          }
        }
      }
      /** Set color mode on all loaded clouds */
      async setColorMode(mode2) {
        const { PointColorType } = await import('potree-core');
        for (const cloud of this.currentClouds) {
          const mat = cloud.material;
          if (!mat) continue;
          if (!this.worldBox.isEmpty()) {
            mat.heightMin = this.worldBox.min.z;
            mat.heightMax = this.worldBox.max.z;
          }
          switch (mode2) {
            case "rgb":
              if (this.hasRgb) {
                mat.newFormat = true;
                mat.pointColorType = PointColorType.RGB;
              } else {
                mat.newFormat = false;
                mat.pointColorType = PointColorType.HEIGHT;
              }
              break;
            case "height":
              mat.newFormat = false;
              mat.pointColorType = PointColorType.HEIGHT;
              break;
            case "intensity":
              mat.newFormat = false;
              mat.pointColorType = PointColorType.INTENSITY;
              break;
            case "intensity_gradient":
              mat.newFormat = false;
              mat.pointColorType = PointColorType.INTENSITY_GRADIENT;
              break;
            case "classification":
              mat.newFormat = false;
              mat.pointColorType = PointColorType.CLASSIFICATION;
              break;
            case "return_number":
              mat.newFormat = false;
              mat.pointColorType = PointColorType.RETURN_NUMBER;
              break;
            case "source":
              mat.newFormat = false;
              mat.pointColorType = PointColorType.SOURCE;
              break;
          }
          mat.outputColorEncoding = 1;
          mat.needsUpdate = true;
        }
      }
      /** Whether the loaded cloud has RGB data */
      get hasRgbData() {
        return this.hasRgb;
      }
      /** CRS string from metadata.json ("" when not georeferenced). */
      get projection() {
        return this._projection;
      }
      /** Whether the cloud carries a non-empty CRS (eligible for a map basemap). */
      get isGeoreferenced() {
        return this._projection.length > 0;
      }
      /** Georeference status for the cloud info / About dialog. */
      getGeoInfo() {
        return { georeferenced: this.isGeoreferenced, projection: this._projection };
      }
      /** Remove all loaded point clouds from scene */
      clear() {
        for (const cloud of this.currentClouds) {
          this.sceneManager.scene.remove(cloud);
        }
        this.currentClouds = [];
        this.sceneManager.pointClouds = [];
      }
      /** Set point budget on all loaded clouds */
      setPointBudget(budget) {
        if (this.sceneManager.potree) this.sceneManager.potree.pointBudget = budget;
      }
      /** Set point size on all loaded clouds */
      setPointSize(size) {
        for (const cloud of this.currentClouds) {
          const mat = cloud.material;
          if (mat) mat.size = size;
        }
      }
      /** Set point shape: 0=SQUARE, 1=CIRCLE, 2=PARABOLOID */
      setPointShape(shape) {
        for (const cloud of this.currentClouds) {
          const mat = cloud.material;
          if (mat) {
            mat.shape = shape;
            mat.needsUpdate = true;
          }
        }
      }
      /** Set point size type: 0=FIXED, 1=ATTENUATED, 2=ADAPTIVE */
      setPointSizeType(type) {
        for (const cloud of this.currentClouds) {
          const mat = cloud.material;
          if (mat) {
            mat.pointSizeType = type;
            mat.needsUpdate = true;
          }
        }
      }
      /** Read metadata.json from adapter */
      async readMetadata(path = "metadata.json") {
        try {
          return await this.adapter.fetchJson(path);
        } catch {
          return null;
        }
      }
      /** Return the first loaded point cloud object, if any */
      getPointCloud() {
        return this.currentClouds[0] ?? null;
      }
      /** Calculate optimal point budget based on total point count */
      static calcOptimalBudget(totalPoints) {
        const ratio = totalPoints < 5e6 ? 0.3 : totalPoints < 5e7 ? 0.15 : 0.08;
        const raw = Math.round(totalPoints * ratio);
        return Math.min(Math.max(Math.round(raw / 1e5) * 1e5, 5e5), 1e7);
      }
    };
    CameraAnimator = class {
      camera;
      controls;
      animId = null;
      constructor(camera, controls) {
        this.camera = camera;
        this.controls = controls;
      }
      flyTo({ position, target, duration = 800 }) {
        return new Promise((resolve) => {
          if (this.animId !== null) cancelAnimationFrame(this.animId);
          const startPos = this.camera.position.clone();
          const startTarget = this.controls.target.clone();
          const startTime = performance.now();
          const animate = (now) => {
            const t = Math.min((now - startTime) / duration, 1);
            const e = easeOutQuart(t);
            this.camera.position.lerpVectors(startPos, position, e);
            this.controls.target.lerpVectors(startTarget, target, e);
            this.controls.update();
            if (t < 1) {
              this.animId = requestAnimationFrame(animate);
            } else {
              this.animId = null;
              resolve();
            }
          };
          this.animId = requestAnimationFrame(animate);
        });
      }
      /** Fly to a camera marker position (offset behind the camera by `offset` units) */
      flyToCamera(camPos, yawDeg = 0, offset = 5, duration = 800) {
        const pos = Array.isArray(camPos) ? new THREE5.Vector3(camPos[0], camPos[1], camPos[2]) : camPos;
        const yaw = yawDeg * Math.PI / 180;
        const viewerPos = new THREE5.Vector3(
          pos.x - Math.sin(yaw) * offset,
          pos.y - Math.cos(yaw) * offset,
          pos.z + 2
        );
        return this.flyTo({ position: viewerPos, target: pos, duration });
      }
      cancel() {
        if (this.animId !== null) {
          cancelAnimationFrame(this.animId);
          this.animId = null;
        }
      }
    };
    DISPLAY_PRESETS = {
      compact: {
        preset: "compact",
        measurementLineWidth: 1,
        measurementLabelScale: 0.6,
        measurementSphereRadius: 0.08,
        markerSphereScale: 0.7,
        markerSphereOpacity: 0.8,
        markerLabelScale: 0.85,
        markerLabelMode: "hover"
      },
      standard: {
        preset: "standard",
        measurementLineWidth: 2,
        measurementLabelScale: 1,
        measurementSphereRadius: 0.15,
        markerSphereScale: 1,
        markerSphereOpacity: 0.9,
        markerLabelScale: 1,
        markerLabelMode: "hover"
      },
      prominent: {
        preset: "prominent",
        measurementLineWidth: 4,
        measurementLabelScale: 1.6,
        measurementSphereRadius: 0.3,
        markerSphereScale: 1.6,
        markerSphereOpacity: 1,
        markerLabelScale: 1.3,
        markerLabelMode: "always"
      }
    };
    MARKER_COLOR_DEFAULT = 14472518;
    MARKER_COLOR_HOVER = 16777215;
    MARKER_COLOR_SELECTED = 16737860;
    PIN_BASE_SCALE = 0.022;
    MarkerManager = class {
      scene;
      entries = [];
      group;
      hoveredIdx = -1;
      selectedIdx = -1;
      labelMode = "hover";
      _displaySettings = DISPLAY_PRESETS.standard;
      _cameras = [];
      _worldBox;
      /** Shared circular pin texture (reused across all pins; tinted via material.color). */
      _pinTexture;
      /** World-space vertical offset for the label anchor above the pin. */
      _labelOffset = 0.5;
      /** Optional clip predicate — markers whose position fails it are hidden. */
      _clipFilter = null;
      constructor(scene) {
        this.scene = scene;
        this.group = new THREE5.Group();
        this.group.name = "pano-markers";
        this.scene.add(this.group);
      }
      /** Apply new display settings and rebuild all markers */
      applyDisplaySettings(settings) {
        this._displaySettings = settings;
        if (this._cameras.length > 0) {
          this.build(this._cameras, this._worldBox);
        }
      }
      /** Build markers from camera data. Pass worldBox for auto-scaling. */
      build(cameras, worldBox) {
        this._cameras = cameras;
        this._worldBox = worldBox;
        this.labelMode = this._displaySettings.markerLabelMode ?? "hover";
        this.clear();
        if (worldBox && !worldBox.isEmpty()) {
          const size = new THREE5.Vector3();
          worldBox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z);
          this._labelOffset = Math.max(0.2, Math.min(4, maxDim * 0.01));
        }
        const pinScale = PIN_BASE_SCALE * this._displaySettings.markerSphereScale;
        cameras.forEach((cam, i) => {
          if (!cam.position) return;
          const { x, y, z } = cam.position;
          const pin = this._makePin(MARKER_COLOR_DEFAULT, pinScale);
          pin.position.set(x, y, z);
          pin.userData = { cameraIndex: i, cameraData: cam };
          this.group.add(pin);
          const label = this._makeLabel(cam.name);
          label.position.set(x, y, z + this._labelOffset);
          label.visible = this.labelMode === "always";
          this.group.add(label);
          this.entries.push({ pin, label });
        });
        this._applyAllMarkerVisibility();
      }
      /**
       * Hide panorama markers whose camera position falls outside the kept clip
       * region. Pass `null` to clear the filter (all markers visible). The predicate
       * is typically `ClipManager.isPointVisible`.
       */
      applyClipFilter(predicate) {
        this._clipFilter = predicate;
        this._applyAllMarkerVisibility();
      }
      /** Whether a marker survives the active clip filter. */
      _passesClip(idx) {
        if (!this._clipFilter) return true;
        const cam = this._cameras[idx];
        if (!cam?.position) return true;
        return this._clipFilter(new THREE5.Vector3(cam.position.x, cam.position.y, cam.position.z));
      }
      _applyAllMarkerVisibility() {
        for (let i = 0; i < this.entries.length; i++) {
          const entry = this.entries[i];
          const pass = this._passesClip(i);
          entry.pin.visible = pass;
          entry.label.visible = pass && this._labelShouldShow(i);
        }
      }
      /** Lazily build (and cache) the shared circular pin texture. */
      _getPinTexture() {
        if (this._pinTexture) return this._pinTexture;
        const S = 64;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        const c = S / 2;
        ctx.beginPath();
        ctx.arc(c, c, S * 0.46, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c, c, S * 0.34, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(20,20,20,0.85)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(c, c, S * 0.27, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        const tex = new THREE5.CanvasTexture(canvas);
        tex.minFilter = THREE5.LinearFilter;
        this._pinTexture = tex;
        return tex;
      }
      _makePin(color, scale) {
        const mat = new THREE5.SpriteMaterial({
          map: this._getPinTexture(),
          color,
          sizeAttenuation: false,
          // constant on-screen size at any zoom
          depthTest: false,
          // always visible through the point cloud
          depthWrite: false,
          transparent: true,
          opacity: this._displaySettings.markerSphereOpacity
        });
        const sprite = new THREE5.Sprite(mat);
        sprite.scale.set(scale, scale, 1);
        return sprite;
      }
      _makeLabel(text) {
        const W = 200;
        const H = 48;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(15,15,15,0.55)";
        ctx.beginPath();
        ctx.roundRect(0, 0, W, H, 8);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.font = "500 18px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text.substring(0, 22), W / 2, H / 2 + 1);
        const tex = new THREE5.CanvasTexture(canvas);
        tex.minFilter = THREE5.LinearFilter;
        const mat = new THREE5.SpriteMaterial({
          map: tex,
          sizeAttenuation: false,
          // constant on-screen size — never huge
          depthTest: false,
          depthWrite: false,
          transparent: true
        });
        const sprite = new THREE5.Sprite(mat);
        const ls = this._displaySettings.markerLabelScale;
        const h = 0.05 * ls;
        sprite.scale.set(h * (W / H), h, 1);
        return sprite;
      }
      /** Update pin color by index */
      _recolor(idx, color) {
        const entry = this.entries[idx];
        if (!entry) return;
        entry.pin.material.color.setHex(color);
      }
      /** Resolve whether a marker's label should be visible under the current mode. */
      _labelShouldShow(idx) {
        if (this.labelMode === "always") return true;
        if (this.labelMode === "hidden") return false;
        return idx === this.hoveredIdx || idx === this.selectedIdx;
      }
      _applyLabelVisibility(idx) {
        const entry = this.entries[idx];
        if (!entry) return;
        entry.label.visible = this._passesClip(idx) && this._labelShouldShow(idx);
      }
      setVisible(visible) {
        this.group.visible = visible;
      }
      /** Return pin sprites for raycasting (one per camera, index order) */
      getMeshes() {
        return this.entries.map((e) => e.pin);
      }
      setHovered(idx) {
        if (this.hoveredIdx === idx) return;
        const prev = this.hoveredIdx;
        this.hoveredIdx = idx;
        if (prev >= 0 && prev !== this.selectedIdx) {
          this._recolor(prev, MARKER_COLOR_DEFAULT);
          this._applyLabelVisibility(prev);
        }
        if (idx >= 0 && idx !== this.selectedIdx) {
          this._recolor(idx, MARKER_COLOR_HOVER);
          this._applyLabelVisibility(idx);
        }
      }
      setSelected(idx) {
        const prev = this.selectedIdx;
        this.selectedIdx = idx;
        if (prev >= 0) {
          this._recolor(prev, prev === this.hoveredIdx ? MARKER_COLOR_HOVER : MARKER_COLOR_DEFAULT);
          this._applyLabelVisibility(prev);
        }
        if (idx >= 0) {
          this._recolor(idx, MARKER_COLOR_SELECTED);
          this._applyLabelVisibility(idx);
        }
      }
      clear() {
        for (const { pin, label } of this.entries) {
          pin.material.dispose();
          this.group.remove(pin);
          label.material.map?.dispose();
          label.material.dispose();
          this.group.remove(label);
        }
        this.entries = [];
        this.hoveredIdx = -1;
        this.selectedIdx = -1;
      }
      dispose() {
        this.clear();
        this._pinTexture?.dispose();
        this._pinTexture = void 0;
        this.scene.remove(this.group);
      }
    };
    _idCounter = 0;
    COLORS = {
      point: "#DCD546",
      distance: "#DCD546",
      height: "#9B94FF",
      area: "#4ADE80",
      volume: "#F97316",
      angle: "#EC4899",
      profile: "#22D3EE"
    };
    MeasurementManager = class {
      scene;
      group;
      measurements = /* @__PURE__ */ new Map();
      _displaySettings = DISPLAY_PRESETS.standard;
      onChange;
      // Active drawing state
      activeMeasurement = null;
      previewLine = null;
      // Snap preview — cursor indicator + rubber-band line to show where the
      // next point will land before the user clicks. The indicator is a constant
      // on-screen crosshair sprite (not a ball) for precise targeting.
      _snapCross = null;
      _snapLine = null;
      _crossTexture;
      constructor(scene) {
        this.scene = scene;
        this.group = new THREE5.Group();
        this.group.name = "measurements";
        this.scene.add(this.group);
      }
      getAll() {
        return Array.from(this.measurements.values()).map((v) => v.data);
      }
      /** Apply new display settings and rebuild all existing measurements */
      applyDisplaySettings(settings) {
        this._displaySettings = settings;
        this._rebuildAll();
      }
      /** Rebuild all existing measurement visuals with current display settings */
      _rebuildAll() {
        for (const [id, entry] of this.measurements) {
          this._disposeObjects(entry.objects);
          const m = entry.data;
          const newObjects = m.box ? this.buildVolumeBoxObjects(m, new THREE5.Box3(
            new THREE5.Vector3(m.box.min[0], m.box.min[1], m.box.min[2]),
            new THREE5.Vector3(m.box.max[0], m.box.max[1], m.box.max[2])
          )) : this.buildObjects(m);
          this.measurements.set(id, { data: m, objects: newObjects });
        }
      }
      /** Dispose geometry/materials and remove objects from the group */
      _disposeObjects(objects) {
        objects.forEach((o) => {
          if (o instanceof THREE5.Mesh || o instanceof THREE5.Line || o instanceof THREE5.LineSegments) {
            o.geometry.dispose();
            o.material.dispose();
          } else if (o instanceof THREE5.Sprite) {
            o.material.map?.dispose();
            o.material.dispose();
          }
          this.group.remove(o);
        });
      }
      /** Start a new measurement (call addPoint for each click, finish() to complete) */
      start(type) {
        const m = {
          id: nextId(),
          type,
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${_idCounter}`,
          points: [],
          color: COLORS[type],
          visible: true,
          selected: false
        };
        this.activeMeasurement = m;
        return m;
      }
      /** Add a 3D point to the active measurement */
      addPoint(point) {
        if (!this.activeMeasurement) return null;
        this.activeMeasurement.points.push(point.clone());
        const m = this.activeMeasurement;
        if (m.type === "point") {
          return this.finish();
        }
        if (m.type === "distance" && m.points.length === 2) return this.finish();
        if (m.type === "height" && m.points.length === 2) return this.finish();
        if (m.type === "angle" && m.points.length === 3) return this.finish();
        this.rebuildPreview();
        return null;
      }
      /** Finalize the active measurement */
      finish() {
        if (!this.activeMeasurement || this.activeMeasurement.points.length === 0) return null;
        const m = this.activeMeasurement;
        this.activeMeasurement = null;
        this.clearPreview();
        this.clearSnap();
        m.value = this.compute(m);
        const objects = this.buildObjects(m);
        this.measurements.set(m.id, { data: m, objects });
        this.onChange?.(this.getAll());
        return m;
      }
      // ─── Snap Preview ───────────────────────────────────────────────────────────
      /**
       * Show a snap preview at the given world position. Call this on every
       * mousemove while a measurement tool is active. Renders:
       *  - A small sphere at the snap position (shows where the point will be placed)
       *  - A rubber-band line from the last placed point to the snap position
       */
      updateSnap(worldPos, color) {
        const c = new THREE5.Color(color ?? this.activeMeasurement?.color ?? "#DCD546");
        if (!this._snapCross) {
          const mat = new THREE5.SpriteMaterial({
            map: this._getCrossTexture(),
            color: c,
            sizeAttenuation: false,
            // constant pixel size at any zoom
            depthTest: false,
            // always visible through the cloud
            depthWrite: false,
            transparent: true
          });
          this._snapCross = new THREE5.Sprite(mat);
          this._snapCross.scale.set(0.05, 0.05, 1);
          this._snapCross.renderOrder = 5;
          this.group.add(this._snapCross);
        }
        this._snapCross.position.copy(worldPos);
        this._snapCross.material.color.copy(c);
        const lastPt = this.activeMeasurement?.points[this.activeMeasurement.points.length - 1];
        if (lastPt) {
          if (this._snapLine) {
            const positions = this._snapLine.geometry.attributes.position;
            positions.setXYZ(0, lastPt.x, lastPt.y, lastPt.z);
            positions.setXYZ(1, worldPos.x, worldPos.y, worldPos.z);
            positions.needsUpdate = true;
          } else {
            const geo = new THREE5.BufferGeometry().setFromPoints([lastPt, worldPos]);
            const mat = new THREE5.LineDashedMaterial({
              color: c,
              depthTest: false,
              transparent: true,
              opacity: 0.5,
              dashSize: 0.3,
              gapSize: 0.15
            });
            this._snapLine = new THREE5.Line(geo, mat);
            this._snapLine.computeLineDistances();
            this._snapLine.renderOrder = 3;
            this.group.add(this._snapLine);
          }
        } else if (!this.activeMeasurement && !lastPt) ;
      }
      /** Build (and cache) the stylized crosshair sprite texture. */
      _getCrossTexture() {
        if (this._crossTexture) return this._crossTexture;
        const S = 64;
        const canvas = document.createElement("canvas");
        canvas.width = S;
        canvas.height = S;
        const ctx = canvas.getContext("2d");
        const c = S / 2;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        const gap = 6;
        const arm = 22;
        ctx.beginPath();
        ctx.moveTo(c - arm, c);
        ctx.lineTo(c - gap, c);
        ctx.moveTo(c + gap, c);
        ctx.lineTo(c + arm, c);
        ctx.moveTo(c, c - arm);
        ctx.lineTo(c, c - gap);
        ctx.moveTo(c, c + gap);
        ctx.lineTo(c, c + arm);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(c, c, 2.5, 0, Math.PI * 2);
        ctx.stroke();
        const tex = new THREE5.CanvasTexture(canvas);
        tex.minFilter = THREE5.LinearFilter;
        this._crossTexture = tex;
        return tex;
      }
      /** Show/hide ALL measurement objects (the whole group) — used by the Layers panel. */
      setVisible(visible) {
        this.group.visible = visible;
      }
      /** Hide the snap preview (call on mouse leave or tool deactivation) */
      clearSnap() {
        if (this._snapCross) {
          this._snapCross.material.dispose();
          this.group.remove(this._snapCross);
          this._snapCross = null;
        }
        if (this._snapLine) {
          this._snapLine.geometry.dispose();
          this._snapLine.material.dispose();
          this.group.remove(this._snapLine);
          this._snapLine = null;
        }
      }
      // ─── Volume measurement (drag-to-create) ─────────────────────────────────
      _volumeDraft = null;
      /** Show/update a volume draft box preview during drag creation */
      setVolumeDraft(box) {
        if (this._volumeDraft) {
          this._volumeDraft.traverse((o) => {
            if (o instanceof THREE5.Mesh || o instanceof THREE5.LineSegments) {
              o.geometry.dispose();
              o.material.dispose();
            }
          });
          this.group.remove(this._volumeDraft);
          this._volumeDraft = null;
        }
        if (!box || box.isEmpty()) return;
        const draftGroup = new THREE5.Group();
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        box.getCenter(center);
        box.getSize(size);
        const c = new THREE5.Color(COLORS.volume);
        const fillGeo = new THREE5.BoxGeometry(1, 1, 1);
        const fillMat = new THREE5.MeshBasicMaterial({
          color: c,
          opacity: 0.1,
          transparent: true,
          depthWrite: false,
          depthTest: false
        });
        const fill = new THREE5.Mesh(fillGeo, fillMat);
        fill.position.copy(center);
        fill.scale.copy(size);
        fill.renderOrder = 1;
        draftGroup.add(fill);
        const edgesGeo = new THREE5.EdgesGeometry(new THREE5.BoxGeometry(1, 1, 1));
        const edgesMat = new THREE5.LineBasicMaterial({ color: c, depthTest: false, transparent: true, opacity: 0.6 });
        const edges = new THREE5.LineSegments(edgesGeo, edgesMat);
        edges.position.copy(center);
        edges.scale.copy(size);
        edges.renderOrder = 2;
        draftGroup.add(edges);
        this.group.add(draftGroup);
        this._volumeDraft = draftGroup;
      }
      /** Create a volume measurement from a drag-defined box */
      addVolumeMeasurement(box) {
        this.setVolumeDraft(null);
        this.clearSnap();
        const size = new THREE5.Vector3();
        box.getSize(size);
        const volume = size.x * size.y * size.z;
        if (volume <= 0) return null;
        const id = nextId();
        const m = {
          id,
          type: "volume",
          label: `Volume ${_idCounter}`,
          points: [],
          // Not used for box-based volumes
          value: volume,
          box: {
            min: [box.min.x, box.min.y, box.min.z],
            max: [box.max.x, box.max.y, box.max.z]
          },
          color: COLORS.volume,
          visible: true,
          selected: false
        };
        const objects = this.buildVolumeBoxObjects(m, box);
        this.measurements.set(m.id, { data: m, objects });
        this.onChange?.(this.getAll());
        return m;
      }
      buildVolumeBoxObjects(m, box) {
        const objects = [];
        const color = new THREE5.Color(m.color);
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        box.getCenter(center);
        box.getSize(size);
        const fillGeo = new THREE5.BoxGeometry(1, 1, 1);
        const fillMat = new THREE5.MeshBasicMaterial({
          color,
          opacity: 0.12,
          transparent: true,
          depthWrite: false,
          depthTest: false
        });
        const fill = new THREE5.Mesh(fillGeo, fillMat);
        fill.position.copy(center);
        fill.scale.copy(size);
        fill.renderOrder = 1;
        this.group.add(fill);
        objects.push(fill);
        const edgesGeo = new THREE5.EdgesGeometry(new THREE5.BoxGeometry(1, 1, 1));
        const edgesMat = new THREE5.LineBasicMaterial({ color, depthTest: false });
        const edges = new THREE5.LineSegments(edgesGeo, edgesMat);
        edges.position.copy(center);
        edges.scale.copy(size);
        edges.renderOrder = 2;
        this.group.add(edges);
        objects.push(edges);
        const text = formatVolume(m.value);
        const sprite = this.makeTextSprite(text, m.color);
        sprite.position.copy(center).add(new THREE5.Vector3(0, 0, size.z / 2 + 0.5));
        const ls = this._displaySettings.measurementLabelScale;
        sprite.scale.set(3.2 * ls, 0.8 * ls, 1);
        sprite.renderOrder = 3;
        this.group.add(sprite);
        objects.push(sprite);
        return objects;
      }
      // ─── Internals ──────────────────────────────────────────────────────────────
      compute(m) {
        const pts = m.points;
        switch (m.type) {
          case "point":
            return 0;
          case "distance":
            return pts.length >= 2 ? pts[0].distanceTo(pts[1]) : 0;
          case "height":
            return pts.length >= 2 ? Math.abs(pts[1].z - pts[0].z) : 0;
          case "angle": {
            if (pts.length < 3) return 0;
            const a = pts[0].clone().sub(pts[1]).normalize();
            const b = pts[2].clone().sub(pts[1]).normalize();
            return Math.acos(Math.max(-1, Math.min(1, a.dot(b))));
          }
          case "area":
            return this.polygonArea(pts);
          case "volume":
            return this.convexVolume(pts);
          default:
            return 0;
        }
      }
      polygonArea(pts) {
        if (pts.length < 3) return 0;
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i];
          const b = pts[(i + 1) % pts.length];
          area += a.x * b.y - b.x * a.y;
        }
        return Math.abs(area) / 2;
      }
      convexVolume(pts) {
        const box = new THREE5.Box3();
        pts.forEach((p) => box.expandByPoint(p));
        const size = new THREE5.Vector3();
        box.getSize(size);
        return size.x * size.y * size.z;
      }
      buildObjects(m) {
        const objects = [];
        const color = new THREE5.Color(m.color);
        const pts = m.points;
        pts.forEach((p) => {
          const geo = new THREE5.SphereGeometry(this._displaySettings.measurementSphereRadius, 8, 6);
          const mat = new THREE5.MeshBasicMaterial({ color, depthTest: false });
          const mesh = new THREE5.Mesh(geo, mat);
          mesh.position.copy(p);
          mesh.renderOrder = 2;
          this.group.add(mesh);
          objects.push(mesh);
        });
        if (pts.length >= 2) {
          const lineType = m.type === "height" ? "vertical" : "direct";
          if (lineType === "vertical" && m.type === "height") {
            const geo = new THREE5.BufferGeometry().setFromPoints([
              pts[0],
              new THREE5.Vector3(pts[0].x, pts[0].y, pts[1].z)
            ]);
            const mat = new THREE5.LineBasicMaterial({ color, depthTest: false });
            const line = new THREE5.Line(geo, mat);
            line.renderOrder = 1;
            this.group.add(line);
            objects.push(line);
          } else {
            for (let i = 0; i < pts.length - 1; i++) {
              const geo = new THREE5.BufferGeometry().setFromPoints([pts[i], pts[i + 1]]);
              const mat = new THREE5.LineBasicMaterial({ color, depthTest: false });
              const line = new THREE5.Line(geo, mat);
              line.renderOrder = 1;
              this.group.add(line);
              objects.push(line);
            }
            if (m.type === "area" && pts.length >= 3) {
              const geo = new THREE5.BufferGeometry().setFromPoints([pts[pts.length - 1], pts[0]]);
              const mat = new THREE5.LineBasicMaterial({ color, depthTest: false });
              this.group.add(new THREE5.Line(geo, mat));
            }
          }
        }
        if (m.value !== void 0) {
          let text = "";
          switch (m.type) {
            case "distance":
              text = formatLength(m.value);
              break;
            case "height":
              text = formatLength(m.value);
              break;
            case "area":
              text = formatArea(m.value);
              break;
            case "angle":
              text = formatAngle(m.value);
              break;
            case "volume":
              text = formatVolume(m.value);
              break;
            case "point": {
              const p = pts[0];
              text = `${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)}`;
              break;
            }
          }
          if (text) {
            const sprite = this.makeTextSprite(text, m.color);
            const mid = pts.reduce((a, b) => a.clone().add(b), new THREE5.Vector3()).divideScalar(pts.length);
            sprite.position.copy(mid).add(new THREE5.Vector3(0, 0, 1));
            const ls = this._displaySettings.measurementLabelScale;
            sprite.scale.set(3.2 * ls, 0.8 * ls, 1);
            sprite.renderOrder = 3;
            this.group.add(sprite);
            objects.push(sprite);
          }
        }
        return objects;
      }
      makeTextSprite(text, color) {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 48;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(0,0,0,0.78)";
        ctx.roundRect(2, 2, 252, 44, 6);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.font = "bold 28px -apple-system, 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 128, 24);
        const tex = new THREE5.CanvasTexture(canvas);
        return new THREE5.Sprite(new THREE5.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
      }
      rebuildPreview() {
        this.clearPreview();
        if (!this.activeMeasurement || this.activeMeasurement.points.length < 1) return;
        const pts = this.activeMeasurement.points;
        const geo = new THREE5.BufferGeometry().setFromPoints(pts);
        const mat = new THREE5.LineBasicMaterial({
          color: new THREE5.Color(this.activeMeasurement.color),
          depthTest: false,
          transparent: true,
          opacity: 0.7
        });
        this.previewLine = new THREE5.Line(geo, mat);
        this.previewLine.renderOrder = 1;
        this.group.add(this.previewLine);
      }
      clearPreview() {
        if (this.previewLine) {
          this.previewLine.geometry.dispose();
          this.previewLine.material.dispose();
          this.group.remove(this.previewLine);
          this.previewLine = null;
        }
      }
      rename(id, name) {
        const entry = this.measurements.get(id);
        if (!entry) return;
        entry.data.label = name;
        this.onChange?.(this.getAll());
      }
      remove(id) {
        const entry = this.measurements.get(id);
        if (!entry) return;
        this._disposeObjects(entry.objects);
        this.measurements.delete(id);
        this.onChange?.(this.getAll());
      }
      clearAll() {
        for (const id of this.measurements.keys()) this.remove(id);
      }
      dispose() {
        this.clearAll();
        this.clearPreview();
        this.clearSnap();
        this._crossTexture?.dispose();
        this._crossTexture = void 0;
        this.scene.remove(this.group);
      }
    };
    VIEW_DIRECTIONS = {
      top: { pos: new THREE5.Vector3(0, 0, 1), up: new THREE5.Vector3(0, 1, 0) },
      front: { pos: new THREE5.Vector3(0, -1, 0), up: new THREE5.Vector3(0, 0, 1) },
      side: { pos: new THREE5.Vector3(1, 0, 0), up: new THREE5.Vector3(0, 0, 1) },
      back: { pos: new THREE5.Vector3(0, 1, 0), up: new THREE5.Vector3(0, 0, 1) },
      custom: { pos: new THREE5.Vector3(0, 0, 1), up: new THREE5.Vector3(0, 1, 0) }
    };
    ExportManager = class {
      sceneManager;
      constructor(sceneManager) {
        this.sceneManager = sceneManager;
      }
      /** Capture an orthographic view and return as data URL */
      async capture(options) {
        const { view, scale, background, format, quality = 0.95 } = options;
        const { scene, renderer } = this.sceneManager;
        const box = new THREE5.Box3();
        scene.traverse((obj) => {
          if (obj instanceof THREE5.Mesh || obj.name === "pointcloud") {
            try {
              box.expandByObject(obj);
            } catch {
            }
          }
        });
        const size = new THREE5.Vector3();
        const center = new THREE5.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const dir = VIEW_DIRECTIONS[view] ?? VIEW_DIRECTIONS.top;
        const baseW = renderer.domElement.width;
        const baseH = renderer.domElement.height;
        const outW = baseW * scale;
        const outH = baseH * scale;
        const aspect = outW / outH;
        const halfH = Math.max(size.x, size.y, size.z) * 0.6;
        const halfW = halfH * aspect;
        const orthoCamera = new THREE5.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.01, 1e5);
        orthoCamera.position.copy(center).addScaledVector(dir.pos, halfH * 3);
        orthoCamera.up.copy(dir.up);
        orthoCamera.lookAt(center);
        orthoCamera.updateMatrixWorld();
        const rt = new THREE5.WebGLRenderTarget(outW, outH, {
          minFilter: THREE5.LinearFilter,
          magFilter: THREE5.LinearFilter,
          format: THREE5.RGBAFormat
        });
        const prevBg = scene.background;
        if (background === "white") scene.background = new THREE5.Color(16777215);
        else if (background === "black") scene.background = new THREE5.Color(0);
        else scene.background = null;
        renderer.setRenderTarget(rt);
        renderer.setSize(outW, outH);
        renderer.render(scene, orthoCamera);
        renderer.setRenderTarget(null);
        renderer.setSize(renderer.domElement.clientWidth, renderer.domElement.clientHeight);
        scene.background = prevBg;
        const pixels = new Uint8Array(outW * outH * 4);
        renderer.readRenderTargetPixels(rt, 0, 0, outW, outH, pixels);
        rt.dispose();
        const flipped = new Uint8ClampedArray(outW * outH * 4);
        for (let y = 0; y < outH; y++) {
          const src = (outH - 1 - y) * outW * 4;
          const dst = y * outW * 4;
          flipped.set(pixels.subarray(src, src + outW * 4), dst);
        }
        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        canvas.getContext("2d").putImageData(new ImageData(flipped, outW, outH), 0, 0);
        const mime = format === "jpeg" ? "image/jpeg" : "image/png";
        return canvas.toDataURL(mime, quality);
      }
      /** Download a data URL as a file */
      static download(dataUrl, filename) {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename;
        a.click();
      }
    };
    MinimapRenderer = class {
      sceneManager;
      bounds = null;
      // Rendering elements
      container = null;
      glCanvas = null;
      overlayCanvas = null;
      miniRenderer = null;
      orthoCamera;
      // World range (square, padded)
      worldLeft = -50;
      worldRight = 50;
      worldTop = 50;
      worldBottom = -50;
      frameCount = 0;
      constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.orthoCamera = new THREE5.OrthographicCamera(-50, 50, 50, -50, -1e4, 1e4);
        this.orthoCamera.position.set(0, 0, 1e3);
        this.orthoCamera.up.set(0, 1, 0);
        this.orthoCamera.lookAt(0, 0, 0);
      }
      /**
       * Attach to a container element. Creates internal canvases.
       * Container should have position:relative and defined size.
       */
      attach(container) {
        this.dispose();
        this.container = container;
        const w = container.clientWidth || 176;
        const h = container.clientHeight || 176;
        this.glCanvas = document.createElement("canvas");
        this.glCanvas.width = w;
        this.glCanvas.height = h;
        this.glCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;";
        container.appendChild(this.glCanvas);
        this.overlayCanvas = document.createElement("canvas");
        this.overlayCanvas.width = w;
        this.overlayCanvas.height = h;
        this.overlayCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;";
        container.appendChild(this.overlayCanvas);
        try {
          this.miniRenderer = new THREE5.WebGLRenderer({
            canvas: this.glCanvas,
            antialias: false,
            alpha: false
          });
          this.miniRenderer.setPixelRatio(1);
          this.miniRenderer.setSize(w, h, false);
          this.miniRenderer.setClearColor(658970, 1);
        } catch {
          this.miniRenderer = null;
        }
      }
      /** Set world-space bounds of the scene */
      setBounds(bounds) {
        this.bounds = bounds.clone();
        if (bounds.isEmpty()) return;
        const size = new THREE5.Vector3();
        const center = new THREE5.Vector3();
        bounds.getSize(size);
        bounds.getCenter(center);
        const half = Math.max(size.x, size.y) * 0.55;
        this.worldLeft = center.x - half;
        this.worldRight = center.x + half;
        this.worldTop = center.y + half;
        this.worldBottom = center.y - half;
        this.orthoCamera.left = this.worldLeft;
        this.orthoCamera.right = this.worldRight;
        this.orthoCamera.top = this.worldTop;
        this.orthoCamera.bottom = this.worldBottom;
        this.orthoCamera.near = -1e4;
        this.orthoCamera.far = 1e4;
        this.orthoCamera.position.set(center.x, center.y, 1e3);
        this.orthoCamera.lookAt(center.x, center.y, 0);
        this.orthoCamera.updateProjectionMatrix();
      }
      /** Called every frame. Renders 3D scene top-down + overlay. */
      update() {
        this.frameCount++;
        const render3D = this.frameCount % 6 === 0;
        if (render3D) this._render3D();
        if (this.frameCount % 2 === 0) this._drawOverlay();
      }
      _render3D() {
        if (!this.miniRenderer || !this.bounds) return;
        const c = this.container;
        if (c && this.glCanvas) {
          const w = c.clientWidth;
          const h = c.clientHeight;
          if (this.glCanvas.width !== w || this.glCanvas.height !== h) {
            this.glCanvas.width = w;
            this.glCanvas.height = h;
            this.miniRenderer.setSize(w, h, false);
            if (this.overlayCanvas) {
              this.overlayCanvas.width = w;
              this.overlayCanvas.height = h;
            }
          }
        }
        this.miniRenderer.render(this.sceneManager.scene, this.orthoCamera);
      }
      _drawOverlay() {
        if (!this.overlayCanvas) return;
        const ctx = this.overlayCanvas.getContext("2d");
        if (!ctx) return;
        const W = this.overlayCanvas.width;
        const H = this.overlayCanvas.height;
        ctx.clearRect(0, 0, W, H);
        this._drawCamera(ctx, W, H);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("N", W / 2, 10);
      }
      _worldToCanvasX(wx) {
        const W = this.overlayCanvas?.width ?? 176;
        return (wx - this.worldLeft) / (this.worldRight - this.worldLeft) * W;
      }
      _worldToCanvasY(wy) {
        const H = this.overlayCanvas?.height ?? 176;
        return (1 - (wy - this.worldBottom) / (this.worldTop - this.worldBottom)) * H;
      }
      _drawCamera(ctx, _W, _H) {
        const cam = this.sceneManager.camera;
        const dir = new THREE5.Vector3();
        cam.getWorldDirection(dir);
        const cx = this._worldToCanvasX(cam.position.x);
        const cy = this._worldToCanvasY(cam.position.y);
        const angle = Math.atan2(-dir.y, dir.x);
        const fovLen = 28;
        const halfFov = THREE5.MathUtils.degToRad(cam.fov * 0.5 * (1 / Math.max(cam.aspect, 0.1)));
        const left = angle - halfFov;
        const right = angle + halfFov;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(left) * fovLen, cy + Math.sin(left) * fovLen);
        ctx.lineTo(cx + Math.cos(right) * fovLen, cy + Math.sin(right) * fovLen);
        ctx.closePath();
        ctx.fillStyle = "rgba(220,213,70,0.18)";
        ctx.strokeStyle = "rgba(220,213,70,0.55)";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#dcd546";
        ctx.fill();
      }
      /** Convert canvas pixel to world XY position */
      canvasToWorld(cx, cy) {
        const W = this.overlayCanvas?.width ?? 176;
        const H = this.overlayCanvas?.height ?? 176;
        const wx = this.worldLeft + cx / W * (this.worldRight - this.worldLeft);
        const wy = this.worldBottom + (1 - cy / H) * (this.worldTop - this.worldBottom);
        return new THREE5.Vector2(wx, wy);
      }
      /** Handle resize (called by parent when container size changes) */
      resize() {
        if (!this.container) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (this.glCanvas) {
          this.glCanvas.width = w;
          this.glCanvas.height = h;
        }
        if (this.overlayCanvas) {
          this.overlayCanvas.width = w;
          this.overlayCanvas.height = h;
        }
        this.miniRenderer?.setSize(w, h, false);
      }
      dispose() {
        this.miniRenderer?.dispose();
        this.miniRenderer = null;
        if (this.glCanvas?.parentElement) this.glCanvas.remove();
        if (this.overlayCanvas?.parentElement) this.overlayCanvas.remove();
        this.glCanvas = null;
        this.overlayCanvas = null;
        this.container = null;
      }
    };
    DEFAULT_TILE_URL = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
    DEFAULT_ATTRIBUTION = "\xA9 OpenStreetMap contributors \xA9 CARTO";
    EARTH_RADIUS = 6378137;
    EARTH_CIRC = 2 * Math.PI * EARTH_RADIUS;
    EPSG_DEFS = {
      "EPSG:4326": "+proj=longlat +datum=WGS84 +no_defs",
      // ETRS89 / LCC Germany (N-E) — what NavVis IVION exports as
      "EPSG:4839": "+proj=lcc +lat_0=51 +lon_0=10.5 +lat_1=48.6666666666667 +lat_2=53.6666666666667 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
      // ETRS89 / UTM (the modern German standard)
      "EPSG:25832": "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
      "EPSG:25833": "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
    };
    TileBasemapManager = class {
      sm;
      group;
      texLoader = new THREE5.TextureLoader();
      textures = [];
      geometries = [];
      materials = [];
      _built = false;
      attribution = DEFAULT_ATTRIBUTION;
      constructor(sm) {
        this.sm = sm;
        this.group = new THREE5.Group();
        this.group.name = "basemap";
        this.group.visible = false;
        this.group.renderOrder = -10;
        this.sm.scene.add(this.group);
        this.texLoader.setCrossOrigin("anonymous");
      }
      isBuilt() {
        return this._built;
      }
      setVisible(visible) {
        this.group.visible = visible;
      }
      /**
       * Build the basemap for a cloud. Dispatches on the config:
       * - `cfg.crs` → **projected mode** (cloud already in a projected CRS; tiles are
       *   reprojected with proj4 to the cloud's true coordinates).
       * - `cfg.georeference` → **manual-pin mode** (local cloud pinned to a lat/lon).
       * No-ops otherwise.
       */
      async build(worldBox, cfg) {
        this.clear();
        this.group.rotation.set(0, 0, 0);
        this.group.position.set(0, 0, 0);
        if (!cfg || worldBox.isEmpty()) return;
        this.attribution = cfg.attribution ?? DEFAULT_ATTRIBUTION;
        if (cfg.crs) await this._buildProjected(worldBox, cfg);
        else if (cfg.georeference) this._buildManual(worldBox, cfg);
      }
      /** Projected mode — reproject Carto tiles (proj4) to the cloud's CRS coords. */
      async _buildProjected(worldBox, cfg) {
        const def = resolveCrsDef(cfg.crs);
        if (!def) {
          console.warn(`[basemap] unknown crs "${cfg.crs}" \u2014 pass a proj4 string or a known EPSG code`);
          return;
        }
        const mod = await Promise.resolve().then(() => (init_lib(), lib_exports));
        const proj43 = mod.default ?? mod;
        const toGeo = proj43(def, "EPSG:4326");
        const toProj = proj43("EPSG:4326", def);
        const tileUrl = cfg.tileUrl ?? DEFAULT_TILE_URL;
        const maxZoom = cfg.maxZoom ?? 20;
        const groundZ = cfg.georeference?.groundZ ?? worldBox.min.z;
        let latMin = 90, latMax = -90, lonMin = 180, lonMax = -180;
        for (const [x, y] of cornersXY(worldBox)) {
          const [lon, lat] = toGeo.forward([x, y]);
          latMin = Math.min(latMin, lat);
          latMax = Math.max(latMax, lat);
          lonMin = Math.min(lonMin, lon);
          lonMax = Math.max(lonMax, lon);
        }
        const size = new THREE5.Vector3();
        worldBox.getSize(size);
        const cosLat = Math.cos((latMin + latMax) / 2 * Math.PI / 180);
        const targetTileM = Math.min(Math.max(Math.max(size.x, size.y), 20), 400);
        let z = Math.round(Math.log2(EARTH_CIRC * cosLat / targetTileM));
        z = Math.max(1, Math.min(maxZoom, z));
        const xMin = lonToTileX(lonMin, z), xMax = lonToTileX(lonMax, z);
        const yMin = latToTileY(latMax, z), yMax = latToTileY(latMin, z);
        if ((xMax - xMin + 1) * (yMax - yMin + 1) > 64) return;
        for (let tx = xMin; tx <= xMax; tx++) {
          for (let ty = yMin; ty <= yMax; ty++) {
            const nw = toProj.forward([tileXToLon(tx, z), tileYToLat(ty, z)]);
            const se = toProj.forward([tileXToLon(tx + 1, z), tileYToLat(ty + 1, z)]);
            const w = se[0] - nw[0];
            const h = nw[1] - se[1];
            if (w <= 0 || h <= 0) continue;
            this._addTile(tileUrl, z, tx, ty, w, h, (nw[0] + se[0]) / 2, (nw[1] + se[1]) / 2, groundZ, 0);
          }
        }
        this._built = this.group.children.length > 0;
      }
      /** Manual-pin mode — local cloud pinned to a WGS84 lat/lon (equirectangular). */
      _buildManual(worldBox, cfg) {
        const geo = cfg.georeference;
        const tileUrl = cfg.tileUrl ?? DEFAULT_TILE_URL;
        const maxZoom = cfg.maxZoom ?? 20;
        const mpu = geo.metersPerUnit ?? 1;
        const rot = (geo.rotationDeg ?? 0) * Math.PI / 180;
        const groundZ = geo.groundZ ?? worldBox.min.z;
        const cosLat = Math.cos(geo.lat * Math.PI / 180);
        const size = new THREE5.Vector3();
        worldBox.getSize(size);
        const targetTileM = Math.min(Math.max(Math.max(size.x, size.y) * mpu, 20), 400);
        let z = Math.round(Math.log2(EARTH_CIRC * cosLat / targetTileM));
        z = Math.max(1, Math.min(maxZoom, z));
        const toEN = (x, y) => ({
          east: x * mpu * Math.cos(rot) + y * mpu * Math.sin(rot),
          north: -x * mpu * Math.sin(rot) + y * mpu * Math.cos(rot)
        });
        const enToGeo = (east, north) => ({
          lat: geo.lat + north / EARTH_RADIUS * 180 / Math.PI,
          lon: geo.lon + east / (EARTH_RADIUS * cosLat) * 180 / Math.PI
        });
        let latMin = 90, latMax = -90, lonMin = 180, lonMax = -180;
        for (const [cx, cy] of cornersXY(worldBox)) {
          const { east, north } = toEN(cx, cy);
          const g = enToGeo(east, north);
          latMin = Math.min(latMin, g.lat);
          latMax = Math.max(latMax, g.lat);
          lonMin = Math.min(lonMin, g.lon);
          lonMax = Math.max(lonMax, g.lon);
        }
        const xMin = lonToTileX(lonMin, z), xMax = lonToTileX(lonMax, z);
        const yMin = latToTileY(latMax, z), yMax = latToTileY(latMin, z);
        if ((xMax - xMin + 1) * (yMax - yMin + 1) > 64) return;
        const deg2rad = Math.PI / 180;
        const geoToEnu = (lat, lon) => ({
          east: (lon - geo.lon) * deg2rad * EARTH_RADIUS * cosLat,
          north: (lat - geo.lat) * deg2rad * EARTH_RADIUS
        });
        for (let tx = xMin; tx <= xMax; tx++) {
          for (let ty = yMin; ty <= yMax; ty++) {
            const nw = geoToEnu(tileYToLat(ty, z), tileXToLon(tx, z));
            const se = geoToEnu(tileYToLat(ty + 1, z), tileXToLon(tx + 1, z));
            const w = (se.east - nw.east) / mpu;
            const h = (nw.north - se.north) / mpu;
            if (w <= 0 || h <= 0) continue;
            this._addTile(tileUrl, z, tx, ty, w, h, (nw.east + se.east) / 2 / mpu, (nw.north + se.north) / 2 / mpu, 0, 0);
          }
        }
        this.group.rotation.set(0, 0, -rot);
        this.group.position.set(0, 0, groundZ);
        this._built = this.group.children.length > 0;
      }
      /** Create one tile plane (grey placeholder) and load its texture. */
      _addTile(tileUrl, z, tx, ty, w, h, cx, cy, meshZ, rotZ) {
        const gmat = new THREE5.PlaneGeometry(w, h);
        const mat = new THREE5.MeshBasicMaterial({
          color: 8421504,
          // grey until the tile texture loads
          depthWrite: false,
          side: THREE5.DoubleSide
        });
        const mesh = new THREE5.Mesh(gmat, mat);
        mesh.position.set(cx, cy, meshZ);
        mesh.rotation.z = rotZ;
        mesh.renderOrder = -10;
        this.group.add(mesh);
        this.geometries.push(gmat);
        this.materials.push(mat);
        const url = tileUrl.replace("{z}", String(z)).replace("{x}", String(tx)).replace("{y}", String(ty)).replace("{s}", "a").replace("{r}", "");
        this.texLoader.load(
          url,
          (tex) => {
            tex.colorSpace = THREE5.LinearSRGBColorSpace;
            tex.minFilter = THREE5.LinearFilter;
            mat.map = tex;
            mat.color.setHex(16777215);
            mat.needsUpdate = true;
            this.textures.push(tex);
          },
          void 0,
          () => {
          }
        );
      }
      clear() {
        for (const m of this.group.children.slice()) this.group.remove(m);
        for (const t of this.textures) t.dispose();
        for (const g of this.geometries) g.dispose();
        for (const m of this.materials) m.dispose();
        this.textures = [];
        this.geometries = [];
        this.materials = [];
        this._built = false;
      }
      dispose() {
        this.clear();
        this.sm.scene.remove(this.group);
      }
    };
    AXIS_COLOR = {
      x: 15680580,
      y: 2278750,
      z: 3900150
    };
    HANDLE_HOVER_COLOR = 16777215;
    HANDLE_DRAG_COLOR = 16347926;
    FaceHandleController = class {
      scene;
      camera;
      domElement;
      handles = [];
      box = null;
      onChange = null;
      drag = null;
      hoveredHandle = null;
      raycaster = new THREE5.Raycaster();
      group;
      disposed = false;
      /** Orientation of the box (full 3-axis rotation). */
      _quaternion = new THREE5.Quaternion();
      constructor(scene, camera, domElement) {
        this.scene = scene;
        this.camera = camera;
        this.domElement = domElement;
        this.group = new THREE5.Group();
        this.group.name = "face-handles";
        this.scene.add(this.group);
        this.createHandles();
      }
      createHandles() {
        const axes = ["x", "y", "z"];
        const signs = [1, -1];
        const geo = new THREE5.SphereGeometry(1, 12, 8);
        for (const axis of axes) {
          for (const sign of signs) {
            const mat = new THREE5.MeshBasicMaterial({
              color: AXIS_COLOR[axis],
              transparent: true,
              opacity: 0.95,
              depthTest: false
            });
            const mesh = new THREE5.Mesh(geo, mat);
            mesh.renderOrder = 10;
            mesh.visible = false;
            mesh.userData = { faceHandle: true, axis, sign };
            this.group.add(mesh);
            this.handles.push({ mesh, axis, sign });
          }
        }
      }
      attach(box, onChange) {
        this.box = box;
        this.onChange = onChange;
        this.updatePositions();
        for (const h of this.handles) h.mesh.visible = true;
      }
      /** Set the box's orientation (full 3-axis) so handles follow it. */
      setQuaternion(q) {
        this._quaternion.copy(q);
        if (this.box) this.updatePositions();
      }
      detach() {
        this.box = null;
        this.onChange = null;
        this.drag = null;
        this.hoveredHandle = null;
        for (const h of this.handles) h.mesh.visible = false;
      }
      isAttached() {
        return this.box !== null;
      }
      /** Show/hide the whole handle group without detaching (keeps box binding). */
      setGroupVisible(visible) {
        this.group.visible = visible;
      }
      isDragging() {
        return this.drag !== null;
      }
      getHandleMeshes() {
        return this.handles.map((h) => h.mesh);
      }
      /** Update handle positions and sizes to match the current box */
      updatePositions() {
        if (!this.box) return;
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        this.box.getCenter(center);
        this.box.getSize(size);
        const diag = size.length();
        const radius = Math.max(0.08, Math.min(diag * 0.03, 3));
        for (const h of this.handles) {
          const offset = new THREE5.Vector3();
          if (h.sign === 1) {
            offset[h.axis] = this.box.max[h.axis] - center[h.axis];
          } else {
            offset[h.axis] = this.box.min[h.axis] - center[h.axis];
          }
          const half = Math.abs(offset[h.axis]);
          offset[h.axis] += h.sign * (half * 0.12 + radius * 1.5);
          offset.applyQuaternion(this._quaternion);
          h.mesh.position.set(center.x + offset.x, center.y + offset.y, center.z + offset.z);
          h.mesh.scale.setScalar(radius);
        }
      }
      /**
       * Try to start a drag. Call on pointerdown.
       * Returns true if a handle was grabbed (caller should disable orbit controls).
       */
      onPointerDown(clientX, clientY) {
        if (!this.box) return false;
        const handle = this.hitTest(clientX, clientY);
        if (!handle) return false;
        const cameraDir = new THREE5.Vector3();
        this.camera.getWorldDirection(cameraDir);
        const plane = new THREE5.Plane().setFromNormalAndCoplanarPoint(
          cameraDir.negate(),
          handle.mesh.position.clone()
        );
        this.setRaycasterFromClient(clientX, clientY);
        const startIntersect = new THREE5.Vector3();
        if (!this.raycaster.ray.intersectPlane(plane, startIntersect)) return false;
        const startCenter = new THREE5.Vector3();
        const startSize = new THREE5.Vector3();
        this.box.getCenter(startCenter);
        this.box.getSize(startSize);
        this.drag = {
          handle,
          plane,
          startIntersect,
          startCenter,
          startSize,
          worldAxis: this.worldAxisFor(handle.axis)
        };
        this.setHandleColor(handle, HANDLE_DRAG_COLOR);
        return true;
      }
      /** World-space unit vector for a box-local face axis, rotated by the box orientation. */
      worldAxisFor(axis) {
        const local = new THREE5.Vector3(
          axis === "x" ? 1 : 0,
          axis === "y" ? 1 : 0,
          axis === "z" ? 1 : 0
        );
        return local.applyQuaternion(this._quaternion);
      }
      /** Update the box during a drag. Call on pointermove. */
      onPointerMove(clientX, clientY) {
        if (!this.drag || !this.box) return;
        this.setRaycasterFromClient(clientX, clientY);
        const currentIntersect = new THREE5.Vector3();
        if (!this.raycaster.ray.intersectPlane(this.drag.plane, currentIntersect)) return;
        const axis = this.drag.handle.axis;
        const s = this.drag.handle.sign;
        const worldDelta = currentIntersect.clone().sub(this.drag.startIntersect);
        const delta = worldDelta.dot(this.drag.worldAxis);
        const MIN_SIZE = 0.1;
        const startSizeA = this.drag.startSize[axis];
        const newSizeA = Math.max(MIN_SIZE, startSizeA + s * delta);
        const grow = newSizeA - startSizeA;
        const center = this.drag.startCenter.clone().addScaledVector(this.drag.worldAxis, s * grow / 2);
        const size = this.drag.startSize.clone();
        size[axis] = newSizeA;
        const half = size.clone().multiplyScalar(0.5);
        this.box.min.copy(center).sub(half);
        this.box.max.copy(center).add(half);
        this.updatePositions();
        this.onChange?.(this.box);
      }
      /** End the drag. Call on pointerup. */
      onPointerUp() {
        if (this.drag) {
          this.setHandleColor(this.drag.handle, AXIS_COLOR[this.drag.handle.axis]);
          this.drag = null;
        }
      }
      /** Update hover highlight. Call on pointermove when not dragging. */
      updateHover(clientX, clientY) {
        if (this.drag || !this.box) return;
        const hit = this.hitTest(clientX, clientY);
        if (hit !== this.hoveredHandle) {
          if (this.hoveredHandle) {
            this.setHandleColor(this.hoveredHandle, AXIS_COLOR[this.hoveredHandle.axis]);
          }
          this.hoveredHandle = hit;
          if (hit) {
            this.setHandleColor(hit, HANDLE_HOVER_COLOR);
          }
        }
      }
      dispose() {
        if (this.disposed) return;
        this.disposed = true;
        for (const h of this.handles) {
          h.mesh.geometry.dispose();
          h.mesh.material.dispose();
        }
        this.scene.remove(this.group);
      }
      hitTest(clientX, clientY) {
        if (!this.box) return null;
        this.setRaycasterFromClient(clientX, clientY);
        const meshes = this.handles.filter((h) => h.mesh.visible).map((h) => h.mesh);
        const intersects = this.raycaster.intersectObjects(meshes);
        if (intersects.length === 0) return null;
        const hitMesh = intersects[0].object;
        return this.handles.find((h) => h.mesh === hitMesh) ?? null;
      }
      setRaycasterFromClient(clientX, clientY) {
        const rect = this.domElement.getBoundingClientRect();
        const nx = (clientX - rect.left) / rect.width * 2 - 1;
        const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(new THREE5.Vector2(nx, ny), this.camera);
      }
      setHandleColor(handle, color) {
        handle.mesh.material.color.setHex(color);
      }
    };
    _nextId = 1;
    ClipManager = class {
      sm;
      entries = [];
      helpers = /* @__PURE__ */ new Map();
      fills = /* @__PURE__ */ new Map();
      draftHelper = null;
      selectedId = null;
      /** Move gizmo (translate arrows) — used in "translate" transform mode. */
      tcMove = null;
      /** Rotate gizmo (full XYZ rings) — used in "rotate" transform mode. */
      tcRotate = null;
      pivot = null;
      _faceHandles = null;
      /** Active transform mode for the selected box (move / scale / rotate). */
      _transformMode = "scale";
      /** Global clipping enable flag. When false, boxes stay visible but no clipping is applied. */
      _enabled = true;
      /** Whether box outlines / fills / handles render at all (off = clean screenshots). */
      _outlinesVisible = true;
      onChange;
      onSelectChange;
      constructor(sm) {
        this.sm = sm;
      }
      async initTransformControls() {
        if (this.tcMove && this.tcRotate) return;
        const { TransformControls } = await import('three/examples/jsm/controls/TransformControls.js');
        const makeTc = (mode2, size) => {
          const tc = new TransformControls(this.sm.camera, this.sm.renderer.domElement);
          tc.setSpace("world");
          tc.setMode(mode2);
          tc.setSize(size);
          tc.addEventListener("change", () => this.syncFromPivot());
          tc.addEventListener("dragging-changed", (e) => {
            this.sm.controls.enabled = !e.value;
          });
          this.sm.scene.add(tc.getHelper());
          return tc;
        };
        this.tcMove = makeTc("translate", 0.8);
        this.tcRotate = makeTc("rotate", 1.1);
        this._raiseGizmo();
      }
      /**
       * Force the TransformControls gizmos to render on top of the point cloud.
       * The gizmos use default materials (depthTest=true, renderOrder=0) so they are
       * occluded by the dense cloud. Traverse each gizmo tree and disable depth
       * testing so the arrows/rings draw through.
       */
      _raiseGizmo() {
        for (const tc of [this.tcMove, this.tcRotate]) {
          const helper = tc?.getHelper?.();
          if (!helper) continue;
          helper.traverse((child) => {
            if (!child.material) return;
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            for (const m of mats) {
              m.depthTest = false;
              m.depthWrite = false;
              m.transparent = true;
            }
            child.renderOrder = 5;
          });
        }
      }
      /**
       * Build an axis-aligned box centered on the current view target, sized to sit
       * comfortably INSIDE the viewport at the current camera distance, then clamped
       * to the cloud bounds. This replaces the old behavior of spanning the whole
       * world box, which routinely extended far outside the viewport (and dwarfed
       * the resize handles). The result is always fully visible and easy to grab.
       */
      makeViewportBox(worldBox) {
        const cam = this.sm.camera;
        const target = this.sm.controls.target.clone();
        const dist = cam.position.distanceTo(target) || 1;
        const vfov = THREE5.MathUtils.degToRad(cam.fov || 50);
        const halfH = Math.tan(vfov / 2) * dist;
        const halfW = halfH * (cam.aspect || 1);
        let half = Math.min(halfH, halfW) * 0.45;
        let halfZ = half * 0.6;
        if (worldBox && !worldBox.isEmpty()) {
          const ws = new THREE5.Vector3();
          worldBox.getSize(ws);
          half = Math.min(half, ws.x * 0.5, ws.y * 0.5);
          halfZ = Math.min(halfZ, ws.z * 0.5);
          target.clamp(worldBox.min, worldBox.max);
        }
        half = Math.max(half, 0.25);
        halfZ = Math.max(halfZ, 0.15);
        return new THREE5.Box3(
          new THREE5.Vector3(target.x - half, target.y - half, target.z - halfZ),
          new THREE5.Vector3(target.x + half, target.y + half, target.z + halfZ)
        );
      }
      /**
       * Add a clip box sized to fit the current viewport (see {@link makeViewportBox}).
       * Preferred over `addBox(worldBox.clone())` for the "create default box" action.
       */
      addDefaultBox(worldBox, name) {
        return this.addBox(this.makeViewportBox(worldBox), name);
      }
      addBox(box, name) {
        const id = genId();
        const entry = {
          id,
          name: name ?? `Box ${this.entries.length + 1}`,
          box: box.clone(),
          mode: "outside",
          visible: true,
          quaternion: new THREE5.Quaternion()
        };
        this.entries.push(entry);
        this.updateHelper(entry);
        this.applyAll();
        this.onChange?.(this.getBoxes());
        return entry;
      }
      async selectBox(id) {
        this._highlightHelper(this.selectedId, false);
        this._detachGizmos();
        if (this.pivot) {
          this.sm.scene.remove(this.pivot);
          this.pivot.geometry.dispose();
          this.pivot = null;
        }
        this._faceHandles?.detach();
        this.selectedId = id;
        this.onSelectChange?.(id);
        if (!id) return;
        const entry = this.entries.find((e) => e.id === id);
        if (!entry) return;
        await this.initTransformControls();
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        entry.box.getCenter(center);
        entry.box.getSize(size);
        const geo = new THREE5.BoxGeometry(1, 1, 1);
        const mat = new THREE5.MeshBasicMaterial({ visible: false });
        this.pivot = new THREE5.Mesh(geo, mat);
        this.pivot.position.copy(center);
        this.pivot.scale.copy(size);
        this.pivot.quaternion.copy(entry.quaternion);
        this.pivot.userData.clipId = id;
        this.sm.scene.add(this.pivot);
        if (!this._faceHandles) {
          this._faceHandles = new FaceHandleController(
            this.sm.scene,
            this.sm.camera,
            this.sm.renderer.domElement
          );
        }
        this._applyTransformMode();
        this._applyOutlineVisibility();
        this._highlightHelper(id, true);
      }
      /** Switch the active transform mode for the selected box (move/scale/rotate). */
      setTransformMode(mode2) {
        this._transformMode = mode2;
        this._applyTransformMode();
      }
      getTransformMode() {
        return this._transformMode;
      }
      /** Get the face handle controller (for viewport event forwarding) */
      get faceHandles() {
        return this._faceHandles;
      }
      /** Attach the face-resize handles to the selected box with the sync callback. */
      _attachFaceHandles(entry) {
        if (!this._faceHandles) return;
        this._faceHandles.setQuaternion(entry.quaternion);
        this._faceHandles.attach(entry.box, () => {
          this.updateHelper(entry);
          this.applyAll();
          if (this.pivot) {
            const c = new THREE5.Vector3();
            const s = new THREE5.Vector3();
            entry.box.getCenter(c);
            entry.box.getSize(s);
            this.pivot.position.copy(c);
            this.pivot.scale.copy(s);
          }
          this.onChange?.(this.getBoxes());
        });
      }
      /**
       * Show only the handles for the active mode:
       * - `scale` → 6 face-resize spheres (no gizmos),
       * - `translate` → move arrows,
       * - `rotate` → full XYZ rotation rings.
       * Keeping a single set active avoids overlapping handles grabbing each other.
       */
      _applyTransformMode() {
        if (!this.pivot || !this.selectedId) return;
        const move = this.tcMove;
        const rotate = this.tcRotate;
        const entry = this.entries.find((e) => e.id === this.selectedId);
        if (this._transformMode === "scale") {
          move?.detach();
          rotate?.detach();
          if (entry) {
            if (!this._faceHandles?.isAttached()) this._attachFaceHandles(entry);
            this._faceHandles?.setGroupVisible(true);
            this._faceHandles?.updatePositions();
          }
        } else if (this._transformMode === "translate") {
          rotate?.detach();
          this._faceHandles?.detach();
          if (move) {
            move.attach(this.pivot);
            move.showX = move.showY = move.showZ = true;
          }
          this._raiseGizmo();
        } else {
          move?.detach();
          this._faceHandles?.detach();
          if (rotate) {
            rotate.attach(this.pivot);
            rotate.showX = rotate.showY = rotate.showZ = true;
          }
          this._raiseGizmo();
        }
      }
      /** Detach both gizmos. */
      _detachGizmos() {
        this.tcMove?.detach();
        this.tcRotate?.detach();
      }
      /**
       * Reset a box's orientation back to axis-aligned (identity rotation). Targets
       * the given box, or the selected one when omitted.
       */
      resetRotation(id) {
        const targetId = id ?? this.selectedId;
        if (!targetId) return;
        const entry = this.entries.find((e) => e.id === targetId);
        if (!entry) return;
        entry.quaternion.identity();
        if (this.selectedId === targetId) {
          this.pivot?.quaternion.identity();
          this._faceHandles?.setQuaternion(entry.quaternion);
        }
        this.updateHelper(entry);
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      removeBox(id) {
        const idx = this.entries.findIndex((e) => e.id === id);
        if (idx === -1) return;
        this.entries.splice(idx, 1);
        const helper = this.helpers.get(id);
        if (helper) {
          this.sm.scene.remove(helper);
          helper.geometry.dispose();
          this.helpers.delete(id);
        }
        const fill = this.fills.get(id);
        if (fill) {
          this.sm.scene.remove(fill);
          fill.geometry.dispose();
          fill.material.dispose();
          this.fills.delete(id);
        }
        if (this.selectedId === id) {
          this._detachGizmos();
          this._faceHandles?.detach();
          if (this.pivot) {
            this.sm.scene.remove(this.pivot);
            this.pivot.geometry.dispose();
            this.pivot = null;
          }
          this.selectedId = null;
          this.onSelectChange?.(null);
        }
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      setBoxMode(id, mode2) {
        const entry = this.entries.find((e) => e.id === id);
        if (!entry) return;
        entry.mode = mode2;
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      /**
       * Set the clip mode for ALL boxes at once. potree-core only supports a single
       * global clip mode, so boxes must never diverge — use this instead of
       * per-box setBoxMode when changing the effective mode.
       */
      setModeAll(mode2) {
        for (const entry of this.entries) {
          entry.mode = mode2;
        }
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      /**
       * Globally enable/disable clipping without removing any boxes. When disabled,
       * boxes remain visible as wireframes/fills but no actual clipping is applied.
       */
      setEnabled(enabled) {
        this._enabled = enabled;
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      isEnabled() {
        return this._enabled;
      }
      /**
       * Whether a world-space point survives the current clipping (i.e. is part of
       * the kept/visible region). Used to cull out-of-bounds panorama markers and to
       * reject picks on clipped-away points. Returns true when clipping is off or
       * there are no visible boxes.
       */
      isPointVisible(p) {
        if (!this._enabled) return true;
        const visible = this.entries.filter((e) => e.visible);
        if (visible.length === 0) return true;
        const insideAny = visible.some((e) => this._pointInBox(p, e));
        return visible[0].mode === "outside" ? insideAny : !insideAny;
      }
      /** Point-in-(rotated)-box test using the entry's center, size and quaternion. */
      _pointInBox(p, entry) {
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        entry.box.getCenter(center);
        entry.box.getSize(size);
        const local = p.clone().sub(center).applyQuaternion(entry.quaternion.clone().invert());
        return Math.abs(local.x) <= size.x / 2 && Math.abs(local.y) <= size.y / 2 && Math.abs(local.z) <= size.z / 2;
      }
      /**
       * Globally show/hide ALL box outlines, fills, handles and gizmos WITHOUT
       * affecting clipping — clipping stays active so you keep the cropped view but
       * get a clean image (e.g. for screenshots). Per-box visibility still applies
       * when outlines are on.
       */
      setOutlinesVisible(visible) {
        this._outlinesVisible = visible;
        this._applyOutlineVisibility();
      }
      areOutlinesVisible() {
        return this._outlinesVisible;
      }
      /** Apply the global outline flag (and per-box visibility) to all scene objects. */
      _applyOutlineVisibility() {
        const show = this._outlinesVisible;
        for (const entry of this.entries) {
          const helper = this.helpers.get(entry.id);
          if (helper) helper.visible = show && entry.visible;
          const fill = this.fills.get(entry.id);
          if (fill) fill.visible = show && entry.visible;
        }
        const selected = show && this.selectedId !== null;
        if (selected) {
          this._applyTransformMode();
        } else {
          this._detachGizmos();
          this._faceHandles?.setGroupVisible(false);
        }
      }
      setBoxVisible(id, visible) {
        const entry = this.entries.find((e) => e.id === id);
        if (!entry) return;
        entry.visible = visible;
        const helper = this.helpers.get(id);
        if (helper) helper.visible = visible && this._outlinesVisible;
        const fill = this.fills.get(id);
        if (fill) fill.visible = visible && this._outlinesVisible;
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      renameBox(id, name) {
        const entry = this.entries.find((e) => e.id === id);
        if (!entry) return;
        entry.name = name;
        this.onChange?.(this.getBoxes());
      }
      getBoxes() {
        return this.entries.map((e) => ({ ...e, box: e.box.clone() }));
      }
      getSelectedId() {
        return this.selectedId;
      }
      hasBox() {
        return this.entries.length > 0;
      }
      /** Draft box — live drag preview, no clip applied */
      setDraft(box) {
        if (this.draftHelper) {
          this.sm.scene.remove(this.draftHelper);
          this.draftHelper.geometry.dispose();
          this.draftHelper = null;
        }
        if (box && !box.isEmpty()) {
          this.draftHelper = new THREE5.Box3Helper(box, new THREE5.Color(14472518));
          this.draftHelper.material.transparent = true;
          this.draftHelper.material.opacity = 0.6;
          this.draftHelper.renderOrder = 3;
          this.sm.scene.add(this.draftHelper);
        }
      }
      clear() {
        this._detachGizmos();
        this._faceHandles?.detach();
        if (this.pivot) {
          this.sm.scene.remove(this.pivot);
          this.pivot.geometry.dispose();
          this.pivot = null;
        }
        for (const [, helper] of this.helpers) {
          this.sm.scene.remove(helper);
          helper.geometry.dispose();
        }
        this.helpers.clear();
        for (const [, fill] of this.fills) {
          this.sm.scene.remove(fill);
          fill.geometry.dispose();
          fill.material.dispose();
        }
        this.fills.clear();
        this.entries = [];
        this.selectedId = null;
        if (this.draftHelper) {
          this.sm.scene.remove(this.draftHelper);
          this.draftHelper.geometry.dispose();
          this.draftHelper = null;
        }
        this.applyAll();
        this.onChange?.([]);
        this.onSelectChange?.(null);
      }
      dispose() {
        this.clear();
        for (const tc of [this.tcMove, this.tcRotate]) {
          if (!tc) continue;
          this.sm.scene.remove(tc.getHelper());
          tc.dispose();
        }
        this.tcMove = null;
        this.tcRotate = null;
        if (this._faceHandles) {
          this._faceHandles.dispose();
          this._faceHandles = null;
        }
      }
      syncFromPivot() {
        if (!this.pivot || !this.selectedId) return;
        const entry = this.entries.find((e) => e.id === this.selectedId);
        if (!entry) return;
        const center = this.pivot.position.clone();
        const halfSize = new THREE5.Vector3(
          Math.abs(this.pivot.scale.x) * 0.5,
          Math.abs(this.pivot.scale.y) * 0.5,
          Math.abs(this.pivot.scale.z) * 0.5
        );
        entry.box.min.copy(center).sub(halfSize);
        entry.box.max.copy(center).add(halfSize);
        entry.quaternion.copy(this.pivot.quaternion);
        this._faceHandles?.setQuaternion(entry.quaternion);
        this.updateHelper(entry);
        this.applyAll();
        this.onChange?.(this.getBoxes());
      }
      /**
       * Set wireframe color: selected → bright yellow; deselected → black so the
       * inactive crop boxes recede (and read cleanly on light point clouds).
       */
      _highlightHelper(id, selected) {
        if (!id) return;
        const helper = this.helpers.get(id);
        if (helper) {
          helper.material.color.setHex(
            selected ? 16777028 : 0
          );
        }
      }
      updateHelper(entry) {
        if (!this.helpers.has(entry.id)) {
          const helper2 = new THREE5.Box3Helper(entry.box, new THREE5.Color(0));
          helper2.material.linewidth = 1;
          helper2.renderOrder = 3;
          helper2.visible = entry.visible && this._outlinesVisible;
          this.sm.scene.add(helper2);
          this.helpers.set(entry.id, helper2);
        }
        const helper = this.helpers.get(entry.id);
        if (helper) helper.quaternion.copy(entry.quaternion);
        const center = new THREE5.Vector3();
        const size = new THREE5.Vector3();
        entry.box.getCenter(center);
        entry.box.getSize(size);
        const existingFill = this.fills.get(entry.id);
        if (existingFill) {
          existingFill.position.copy(center);
          existingFill.scale.copy(size);
          existingFill.quaternion.copy(entry.quaternion);
        } else {
          const fillGeo = new THREE5.BoxGeometry(1, 1, 1);
          const fillMat = new THREE5.MeshBasicMaterial({
            color: 14472518,
            opacity: 0.08,
            transparent: true,
            depthWrite: false,
            side: THREE5.FrontSide
          });
          const fillMesh = new THREE5.Mesh(fillGeo, fillMat);
          fillMesh.position.copy(center);
          fillMesh.scale.copy(size);
          fillMesh.quaternion.copy(entry.quaternion);
          fillMesh.renderOrder = 2;
          fillMesh.visible = entry.visible && this._outlinesVisible;
          this.sm.scene.add(fillMesh);
          this.fills.set(entry.id, fillMesh);
        }
      }
      applyAll() {
        if (!this._enabled) {
          for (const pc of this.sm.pointClouds) {
            const mat = pc.material;
            if (!mat) continue;
            mat.setClipBoxes([]);
            mat.clipMode = 0;
          }
          return;
        }
        const visible = this.entries.filter((e) => e.visible);
        for (const pc of this.sm.pointClouds) {
          const mat = pc.material;
          if (!mat) continue;
          if (visible.length === 0) {
            mat.setClipBoxes([]);
            mat.clipMode = 0;
            continue;
          }
          const clipBoxes = visible.map((entry) => {
            const size = new THREE5.Vector3();
            const center = new THREE5.Vector3();
            entry.box.getSize(size);
            entry.box.getCenter(center);
            const matrix = new THREE5.Matrix4().compose(center, entry.quaternion, size);
            const inverse35 = matrix.clone().invert();
            return {
              box: entry.box.clone(),
              inverse: inverse35,
              matrix,
              position: center.clone()
            };
          });
          mat.setClipBoxes(clipBoxes);
          mat.clipMode = visible[0].mode === "outside" ? 1 : 2;
        }
      }
    };
    AxisWidget = class {
      _scene;
      _camera;
      _disposables = [];
      _materials = [];
      sm;
      constructor(sm) {
        this.sm = sm;
        this._scene = new THREE5.Scene();
        this._scene.background = null;
        this._camera = new THREE5.PerspectiveCamera(50, 1, 0.1, 100);
        this._buildAxes();
      }
      _buildAxes() {
        const axes = [
          { dir: new THREE5.Vector3(1, 0, 0), color: 15087942, label: "X" },
          // red
          { dir: new THREE5.Vector3(0, 1, 0), color: 2792847, label: "Y" },
          // teal
          { dir: new THREE5.Vector3(0, 0, 1), color: 4553629, label: "Z" }
          // blue
        ];
        for (const axis of axes) {
          const mat = new THREE5.MeshBasicMaterial({ color: axis.color });
          this._materials.push(mat);
          const quat = new THREE5.Quaternion().setFromUnitVectors(
            new THREE5.Vector3(0, 1, 0),
            axis.dir
          );
          const shaftGeo = new THREE5.CylinderGeometry(0.03, 0.03, 0.65, 6);
          shaftGeo.translate(0, 0.325, 0);
          shaftGeo.applyQuaternion(quat);
          this._scene.add(new THREE5.Mesh(shaftGeo, mat));
          this._disposables.push(shaftGeo);
          const coneGeo = new THREE5.ConeGeometry(0.08, 0.2, 8);
          coneGeo.translate(0, 0.76, 0);
          coneGeo.applyQuaternion(quat);
          this._scene.add(new THREE5.Mesh(coneGeo, mat));
          this._disposables.push(coneGeo);
          const sprite = this._makeLabel(axis.label, axis.color);
          const tipPos = axis.dir.clone().multiplyScalar(1.05);
          sprite.position.copy(tipPos);
          sprite.scale.set(0.28, 0.28, 1);
          this._scene.add(sprite);
        }
      }
      /** Create a canvas-based sprite with the axis letter */
      _makeLabel(letter, color) {
        const res = 64;
        const canvas = document.createElement("canvas");
        canvas.width = res;
        canvas.height = res;
        const ctx = canvas.getContext("2d");
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `bold ${res * 0.6}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillText(letter, res / 2 + 1, res / 2 + 1);
        const hex = "#" + color.toString(16).padStart(6, "0");
        ctx.fillStyle = hex;
        ctx.fillText(letter, res / 2, res / 2);
        const tex = new THREE5.CanvasTexture(canvas);
        tex.minFilter = THREE5.LinearFilter;
        const mat = new THREE5.SpriteMaterial({
          map: tex,
          transparent: true,
          depthTest: false
        });
        this._materials.push(mat);
        return new THREE5.Sprite(mat);
      }
      /**
       * Render the widget into a scissor region in the bottom-left corner.
       * Must be called from a post-render callback after the main scene renders.
       */
      render() {
        const renderer = this.sm.renderer;
        const el = renderer.domElement;
        const W = el.clientWidth;
        const H = el.clientHeight;
        if (W === 0 || H === 0) return;
        const size = 100;
        const margin = 10;
        const savedVp = new THREE5.Vector4();
        const savedSc = new THREE5.Vector4();
        renderer.getViewport(savedVp);
        renderer.getScissor(savedSc);
        const savedScTest = renderer.getScissorTest();
        const savedAutoClear = renderer.autoClear;
        const dist = 3;
        const offset = new THREE5.Vector3(0, 0, dist).applyQuaternion(
          this.sm.camera.quaternion
        );
        this._camera.position.copy(offset);
        this._camera.up.copy(this.sm.camera.up);
        this._camera.lookAt(0, 0, 0);
        const x = margin;
        const y = margin;
        renderer.autoClear = false;
        renderer.setScissorTest(true);
        renderer.setScissor(x, y, size, size);
        renderer.setViewport(x, y, size, size);
        renderer.clearDepth();
        renderer.render(this._scene, this._camera);
        renderer.setViewport(savedVp);
        renderer.setScissor(savedSc);
        renderer.setScissorTest(savedScTest);
        renderer.autoClear = savedAutoClear;
      }
      dispose() {
        for (const g of this._disposables) g.dispose();
        for (const m of this._materials) {
          if (m instanceof THREE5.SpriteMaterial) m.map?.dispose();
          m.dispose();
        }
        this._disposables = [];
        this._materials = [];
      }
    };
    MAX_SCENES = 50;
    _nextId2 = 1;
    PresentationManager = class {
      storageKey;
      scenes = [];
      onChange;
      constructor(sourceKey) {
        this.storageKey = `pcv_scenes_${sourceKey}`;
        this.load();
      }
      load() {
        try {
          const raw = localStorage.getItem(this.storageKey);
          if (raw) this.scenes = JSON.parse(raw);
        } catch {
          this.scenes = [];
        }
      }
      persist() {
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.scenes));
        } catch {
        }
        this.onChange?.(this.getScenes());
      }
      getScenes() {
        return [...this.scenes];
      }
      addScene(scene) {
        const entry = {
          ...scene,
          id: genSceneId(),
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.scenes.unshift(entry);
        if (this.scenes.length > MAX_SCENES) this.scenes.length = MAX_SCENES;
        this.persist();
        return entry;
      }
      removeScene(id) {
        this.scenes = this.scenes.filter((s) => s.id !== id);
        this.persist();
      }
      renameScene(id, name) {
        const scene = this.scenes.find((s) => s.id === id);
        if (scene) {
          scene.name = name;
          this.persist();
        }
      }
      /** Export all scenes as a JSON string (for sharing / backup) */
      exportJSON() {
        return JSON.stringify(this.scenes, null, 2);
      }
      /** Import scenes from JSON string, merging with existing */
      importJSON(json) {
        try {
          const imported = JSON.parse(json);
          if (!Array.isArray(imported)) return 0;
          const existingIds = new Set(this.scenes.map((s) => s.id));
          let count = 0;
          for (const scene of imported) {
            if (!scene.id || !scene.name || !scene.camera) continue;
            if (existingIds.has(scene.id)) {
              scene.id = genSceneId();
            }
            this.scenes.push(scene);
            count++;
          }
          if (this.scenes.length > MAX_SCENES) this.scenes.length = MAX_SCENES;
          this.persist();
          return count;
        } catch {
          return 0;
        }
      }
      clear() {
        this.scenes = [];
        this.persist();
      }
    };
    S3SourceAdapter = class {
      baseUrl;
      headers;
      constructor(baseUrl, headers = {}) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
        this.headers = headers;
      }
      resolveUrl(relativePath) {
        return this.baseUrl + relativePath;
      }
      async fetchJson(relativePath) {
        const res = await fetch(this.resolveUrl(relativePath), { headers: this.headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${relativePath}`);
        return res.json();
      }
      async fetchBinary(relativePath) {
        const res = await fetch(this.resolveUrl(relativePath), { headers: this.headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${relativePath}`);
        return res.arrayBuffer();
      }
      fetchWithHeaders(input, init37) {
        const mergedHeaders = { ...this.headers, ...init37?.headers };
        return fetch(input, { ...init37, headers: mergedHeaders });
      }
    };
    ElectronSourceAdapter = class {
      basePath;
      constructor(basePath) {
        this.basePath = basePath.replace(/\\/g, "/");
        if (!this.basePath.endsWith("/")) this.basePath += "/";
      }
      resolveUrl(relativePath) {
        return "file:///" + this.basePath + relativePath;
      }
      async fetchJson(relativePath) {
        const abs = this.basePath + relativePath;
        const win = window;
        if (!win.electronFS) throw new Error("electronFS not available - is preload loaded?");
        const data = await win.electronFS.readFile(abs, "utf-8");
        return JSON.parse(data);
      }
      async fetchBinary(relativePath) {
        const abs = this.basePath + relativePath;
        const win = window;
        if (!win.electronFS) throw new Error("electronFS not available");
        const buffer = await win.electronFS.readFileBinary(abs);
        return buffer;
      }
      async listDirectories(path) {
        const win = window;
        if (!win.electronFS) return [];
        return win.electronFS.readdir(this.basePath + path);
      }
    };
  }
});
function useViewer() {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used inside <ViewerProvider>");
  return ctx;
}
function ViewerProvider({ config, children }) {
  const [sceneManager, _setSceneManager] = useState(null);
  const [loader, _setLoader] = useState(null);
  const [measurementManager, _setMeasurementManager] = useState(null);
  const [markerManager, _setMarkerManager] = useState(null);
  const [cameraAnimator, _setCameraAnimator] = useState(null);
  const [exporter, _setExporter] = useState(null);
  const [minimap, _setMinimap] = useState(null);
  const [clipManager, _setClipManager] = useState(null);
  const [activeTool, setActiveTool] = useState("none");
  const [pointBudget, setPointBudget] = useState(config.pointBudget ?? 2e6);
  const [pointSize, setPointSize] = useState(1.5);
  const [fps, setFps] = useState(0);
  const [pointCount, setPointCount] = useState(0);
  const [measurementList, setMeasurementList] = useState([]);
  const [showMarkers, setShowMarkers] = useState(true);
  const [showMinimap, setShowMinimap] = useState(config.showMinimap ?? true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showBasemap, setShowBasemap] = useState(false);
  const [basemapAvailable, setBasemapAvailable] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [clipBoxEntries, setClipBoxEntries] = useState([]);
  const [selectedClipBoxId, setSelectedClipBoxId] = useState(null);
  const [colorMode, setColorMode] = useState("rgb");
  const [navigationMode, _setNavigationMode] = useState("orbit");
  const [projection, _setProjection] = useState("perspective");
  const [displaySettings, setDisplaySettings] = useState(() => ({
    ...DISPLAY_PRESETS.standard,
    ...config.displaySettings
  }));
  const setNavigationMode = useCallback((mode2) => {
    _setNavigationMode(mode2);
  }, []);
  const setProjection = useCallback((mode2) => {
    _setProjection(mode2);
  }, []);
  const setSceneManager = useCallback((sm) => _setSceneManager(sm), []);
  const setLoader = useCallback((l) => _setLoader(l), []);
  const setMeasurementManager = useCallback((m) => _setMeasurementManager(m), []);
  const setMarkerManager = useCallback((m) => _setMarkerManager(m), []);
  const setCameraAnimator = useCallback((a) => _setCameraAnimator(a), []);
  const setExporter = useCallback((e) => _setExporter(e), []);
  const setMinimap = useCallback((r) => _setMinimap(r), []);
  const setClipManager = useCallback((c) => _setClipManager(c), []);
  const uiMode = config.uiMode ?? "professional";
  const [panoEngine, setPanoEngine] = useState(config.panoEngine ?? "photo-sphere-viewer");
  const value = {
    sceneManager,
    loader,
    measurementManager,
    markerManager,
    cameraAnimator,
    exporter,
    minimap,
    clipManager,
    setSceneManager,
    setLoader,
    setMeasurementManager,
    setMarkerManager,
    setCameraAnimator,
    setExporter,
    setMinimap,
    setClipManager,
    activeTool,
    setActiveTool,
    pointBudget,
    setPointBudget,
    pointSize,
    setPointSize,
    fps,
    setFps,
    pointCount,
    setPointCount,
    measurementList,
    setMeasurementList,
    showMarkers,
    setShowMarkers,
    showMinimap,
    setShowMinimap,
    showMeasurements,
    setShowMeasurements,
    showBasemap,
    setShowBasemap,
    basemapAvailable,
    setBasemapAvailable,
    selectedCamera,
    setSelectedCamera,
    clipBoxEntries,
    setClipBoxEntries,
    selectedClipBoxId,
    setSelectedClipBoxId,
    colorMode,
    setColorMode,
    navigationMode,
    setNavigationMode,
    projection,
    setProjection,
    displaySettings,
    setDisplaySettings,
    uiMode,
    panoEngine,
    setPanoEngine,
    config
  };
  return /* @__PURE__ */ jsx(ViewerContext.Provider, { value, children });
}
var ViewerContext;
var init_viewer_provider = __esm({
  "src/providers/viewer-provider.tsx"() {
    "use client";
    init_dist();
    ViewerContext = createContext(null);
  }
});
function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside <DataProvider>");
  return ctx;
}
function DataProvider({ adapter, children }) {
  const [cameras, setCameras] = useState([]);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rev, setRev] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const load = async () => {
      try {
        const [cams, meta] = await Promise.allSettled([
          adapter.fetchJson("cameras.json"),
          adapter.fetchJson("metadata.json")
        ]);
        if (cancelled) return;
        if (cams.status === "fulfilled") {
          const resolved = (cams.value ?? []).map((cam) => ({
            ...cam,
            image: cam.image ? adapter.resolveUrl(cam.image) : null,
            thumbnail: cam.thumbnail ? adapter.resolveUrl(cam.thumbnail) : null
          }));
          setCameras(resolved);
        }
        if (meta.status === "fulfilled") setMetadata(meta.value);
      } catch (e) {
        if (!cancelled) setError(String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [adapter, rev]);
  const reload = () => setRev((r) => r + 1);
  return /* @__PURE__ */ jsx(DataContext.Provider, { value: { cameras, metadata, loading, error, reload }, children });
}
var DataContext;
var init_data_provider = __esm({
  "src/providers/data-provider.tsx"() {
    "use client";
    DataContext = createContext(null);
  }
});

// src/i18n/en.ts
var en;
var init_en = __esm({
  "src/i18n/en.ts"() {
    en = {
      toolbar: {
        viewTop: "Top view",
        viewTopLabel: "T",
        viewFront: "Front view",
        viewFrontLabel: "Fr",
        viewBack: "Back view",
        viewBackLabel: "Bk",
        viewLeft: "Left view",
        viewLeftLabel: "L",
        viewRight: "Right view",
        viewRightLabel: "R",
        viewBottom: "Bottom view",
        viewBottomLabel: "Bt",
        budget: "Budget",
        pointBudgetTitle: (m) => `Point budget: ${m.toFixed(1)}M`,
        size: "Size",
        pointSizeTitle: (s) => `Point size: ${s.toFixed(1)}`,
        panoramas: "Panoramas",
        togglePanoramas: "Toggle panorama markers",
        minimap: "Minimap",
        toggleMinimap: "Toggle minimap",
        clouds: "Clouds",
        cloudSelector: "Point cloud selector",
        theme: "Theme",
        switchToLight: "Switch to light",
        switchToDark: "Switch to dark",
        about: "About",
        sidebar: "Sidebar",
        toggleSidebar: "Toggle sidebar",
        colorMode: "Color mode",
        colorRgb: "RGB",
        colorElevation: "Elevation",
        colorIntensity: "Intensity",
        colorIntensityGradient: "Intensity Gradient",
        colorClassification: "Classification",
        colorReturnNumber: "Return Number",
        colorSource: "Source",
        quality: "Quality",
        qualityPerformance: "Performance",
        qualityBalanced: "Balanced",
        qualityHigh: "High Quality",
        navOrbit: "Orbit",
        navFree: "Free",
        navPan: "Pan",
        navOrbitTitle: "Orbit \u2014 CAD turntable, rotate around target",
        navFreeTitle: "Free rotate \u2014 Blender-style, no up-vector lock",
        navPanTitle: "Pan / Map \u2014 left-drag pans, horizon locked",
        camPerspective: "Persp",
        camOrthographic: "Ortho",
        camPerspectiveTitle: "Perspective camera",
        camOrthographicTitle: "Orthographic camera"
      },
      exportPanel: {
        exportImageTitle: "Export orthographic image",
        title: "Export Image",
        view: "View",
        viewTop: "Top (Plan)",
        viewFront: "Front",
        viewSide: "Side",
        viewBack: "Back",
        scale: "Scale",
        background: "Background",
        bgWhite: "white",
        bgBlack: "black",
        bgTransparent: "\u03B1",
        format: "Format",
        exporting: "Exporting\u2026",
        download: "Download"
      },
      toolRail: {
        measureGroup: "M",
        sectionGroup: "S",
        measurePoint: "Point coordinate",
        measureDistance: "Distance",
        measureHeight: "Height difference",
        measureArea: "Area",
        measureVolume: "Volume",
        measureAngle: "Angle",
        measureProfile: "Profile",
        clearMeasurements: "Clear all measurements",
        drawClipBox: "Draw clip box (drag in viewport)",
        clipModeKeepInside: "Mode: keep inside (click to invert)",
        clipModeKeepOutside: "Mode: keep outside (click to invert)",
        removeClipBox: "Remove clip box"
      },
      sidebar: {
        tabLayers: "Layers",
        tabPanoramas: "Panoramas",
        tabScene: "Scene",
        tabMeasurements: "Measurements",
        tabClassification: "Classification",
        tabScenes: "Scenes"
      },
      scenePanel: {
        pointClouds: "Point Clouds",
        noCloudLoaded: "No cloud loaded",
        measurements: "Measurements",
        clearAll: "Clear all",
        none: "None",
        sections: "Sections",
        sectionHint: "Use toolbar to add clipping volumes",
        clipModeNote: "Clip mode applies to all boxes"
      },
      panoPanel: {
        searchPlaceholder: "Search panoramas\u2026",
        noResults: "No panoramas found",
        flyTo: "Fly to"
      },
      classificationPanel: {
        title: "LAS Classes",
        all: "All",
        none: "None",
        classLabels: {
          0: "Never classified",
          1: "Unclassified",
          2: "Ground",
          3: "Low Vegetation",
          4: "Medium Vegetation",
          5: "High Vegetation",
          6: "Building",
          7: "Low Point (Noise)",
          9: "Water",
          17: "Bridge Deck",
          18: "High Noise"
        }
      },
      measurementsPanel: {
        noMeasurements: "No measurements yet.",
        useMeasureToolHint: "Use the toolbar to start measuring.",
        measurementCount: (n) => `${n} measurement${n === 1 ? "" : "s"}`,
        downloadCsv: "Download CSV",
        csv: "CSV",
        clearAll: "Clear all",
        typePoint: "Point",
        typeDistance: "Distance",
        typeHeight: "Height",
        typeArea: "Area",
        typeVolume: "Volume",
        typeAngle: "Angle",
        typeProfile: "Profile"
      },
      viewport: {
        overview: "OVERVIEW",
        hintPoint: "Click to place point \u2022 Esc to cancel",
        hintDistance: "Click 2 points \u2022 Right-click to finish",
        hintHeight: "Click start then end point",
        hintArea: "Click polygon vertices \u2022 Right-click to close",
        hintAngle: "Click 3 points (vertex is middle)",
        hintSectionBox: "Drag to define clipping box",
        initialisingRenderer: "Initialising renderer\u2026",
        statusPts: (m) => `${m.toFixed(1)}M pts`,
        statusBudget: (m) => `Budget: ${m.toFixed(1)}M`,
        statusFps: (fps) => `${fps} fps`
      },
      renderingSettings: {
        title: "Rendering Settings",
        rgbSection: "RGB Adjustments",
        intensitySection: "Intensity Adjustments",
        elevationSection: "Elevation Range",
        generalSection: "General",
        gamma: "Gamma",
        brightness: "Brightness",
        contrast: "Contrast",
        range: "Range",
        elevMin: "Min Z",
        elevMax: "Max Z",
        opacity: "Opacity",
        reset: "Reset to defaults"
      },
      scenesPanel: {
        saveScene: "Save Current View",
        namePlaceholder: "Scene name\u2026",
        save: "Save",
        savedScenes: "Saved Scenes",
        noScenes: "No saved scenes yet.",
        restore: "Restore scene",
        exportJson: "Export scenes as JSON",
        importJson: "Import scenes from JSON"
      },
      displaySettings: {
        title: "Display Settings",
        presetsTab: "Presets",
        advancedTab: "Advanced",
        preset_compact: "Compact",
        preset_compact_desc: "Small labels & markers",
        preset_standard: "Standard",
        preset_standard_desc: "Default sizes",
        preset_prominent: "Prominent",
        preset_prominent_desc: "Large labels & markers",
        measurementsSection: "Measurements",
        lineWidth: "Line Width",
        labelScale: "Label Size",
        sphereRadius: "Point Size",
        markersSection: "Panorama Markers",
        markerScale: "Pin Size",
        markerOpacity: "Pin Opacity",
        markerLabelScale: "Label Size"
      },
      about: {
        title: "About",
        productName: "PanoCloud Viewer",
        description: "A modular point cloud and panorama viewer built with Next.js 15, potree-core, Three.js, and shadcn/ui.",
        engineLabel: "Engine: potree-core + Three.js",
        panoramasLabel: "Panoramas: Pannellum 2.5.6",
        uiLabel: "UI: shadcn/ui + Tailwind CSS"
      },
      panoViewer: {
        close: "Close panorama"
      },
      uiModes: {
        professional: "Professional",
        lite: "Lite",
        modeLabel: "Mode"
      },
      clipToolbar: {
        title: "Clipping",
        addBox: "Add box",
        clearAll: "Clear all",
        keepInside: "Keep inside (all)",
        keepOutside: "Keep outside (all)",
        show: "Show",
        hide: "Hide",
        delete: "Delete",
        move: "Move",
        scale: "Scale",
        rotateZ: "Rotate"
      }
    };
  }
});
function useLocale() {
  return useContext(LocaleContext);
}
function LocaleProvider({ locale = en, children }) {
  return /* @__PURE__ */ jsx(LocaleContext.Provider, { value: locale, children });
}
var LocaleContext;
var init_locale_context = __esm({
  "src/i18n/locale-context.tsx"() {
    "use client";
    init_en();
    LocaleContext = createContext(en);
  }
});
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
var init_utils = __esm({
  "src/lib/utils.ts"() {
    init_dist();
  }
});

// src/components/viewport.tsx
var viewport_exports = {};
__export(viewport_exports, {
  Viewport: () => Viewport
});
function Viewport({ className }) {
  const containerRef = useRef(null);
  const minimapContainerRef = useRef(null);
  const initialized = useRef(false);
  const [minimapSize, setMinimapSize] = React25.useState(176);
  const t = useLocale().viewport;
  const {
    config,
    setSceneManager,
    setLoader,
    setMeasurementManager,
    setMarkerManager,
    setCameraAnimator,
    setExporter,
    setMinimap,
    setClipManager,
    setFps,
    activeTool,
    pointBudget,
    showMarkers,
    showMinimap,
    showMeasurements,
    setMeasurementList,
    setSelectedCamera,
    showBasemap,
    setBasemapAvailable,
    clipBoxEntries,
    setClipBoxEntries,
    setSelectedClipBoxId,
    navigationMode,
    projection,
    displaySettings
  } = useViewer();
  const { cameras, metadata } = useData();
  const metaZRef = useRef(null);
  useEffect(() => {
    if (metadata) {
      metaZRef.current = {
        min: metadata.boundingBox.min[2],
        max: metadata.boundingBox.max[2]
      };
    }
  }, [metadata]);
  const smRef = useRef(null);
  const loaderRef = useRef(null);
  const markerRef = useRef(null);
  const measureRef = useRef(null);
  const minimapRef = useRef(null);
  const basemapRef = useRef(null);
  const clipRef = useRef(null);
  const loupeCanvasRef = useRef(null);
  const [magnifierOn, setMagnifierOn] = React25.useState(false);
  const [loupePos, setLoupePos] = React25.useState({ x: 0, y: 0 });
  const animRef = useRef(null);
  const axisRef = useRef(null);
  const clipDraftRef = useRef(null);
  const clipDownRef = useRef(null);
  const volumeDragRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current || initialized.current) return;
    initialized.current = true;
    const adapter = createAdapter(config.source);
    const sm = new SceneManager({
      canvas: containerRef.current,
      onFpsUpdate: setFps
    });
    const loader = new PointCloudLoader(sm, adapter);
    const measureMgr = new MeasurementManager(sm.scene);
    measureMgr.onChange = (list) => setMeasurementList(list);
    const markerMgr = new MarkerManager(sm.scene);
    const anim = new CameraAnimator(sm.camera, sm.controls);
    const exporter = new ExportManager(sm);
    const minimapRdr = new MinimapRenderer(sm);
    const basemap = new TileBasemapManager(sm);
    basemapRef.current = basemap;
    const clipMgr = new ClipManager(sm);
    clipMgr.onChange = (boxes) => setClipBoxEntries(boxes);
    clipMgr.onSelectChange = (id) => setSelectedClipBoxId(id);
    smRef.current = sm;
    loaderRef.current = loader;
    markerRef.current = markerMgr;
    measureRef.current = measureMgr;
    minimapRef.current = minimapRdr;
    clipRef.current = clipMgr;
    animRef.current = anim;
    setSceneManager(sm);
    setLoader(loader);
    setMeasurementManager(measureMgr);
    setMarkerManager(markerMgr);
    setCameraAnimator(anim);
    setExporter(exporter);
    setMinimap(minimapRdr);
    setClipManager(clipMgr);
    const minimapFrame = () => minimapRdr.update();
    sm.addFrameCallback(minimapFrame);
    const axisWidget = new AxisWidget(sm);
    axisRef.current = axisWidget;
    const axisFrame = () => axisWidget.render();
    sm.addPostRenderCallback(axisFrame);
    sm.start();
    loader.load("metadata.json", pointBudget).then(() => {
      const pc = loader.getPointCloud();
      if (pc) {
        const pca = pc;
        const box = pca.pcoGeometry?.boundingBox ?? pca.boundingBox;
        const tightBox = pca.pcoGeometry?.tightBoundingBox ?? box;
        const offset = pca.pcoGeometry?.offset;
        const worldBox = new THREE5.Box3();
        if (tightBox && offset) {
          worldBox.copy(tightBox);
          worldBox.min.add(offset);
          worldBox.max.add(offset);
        } else if (box) {
          worldBox.copy(box);
        } else {
          worldBox.setFromObject(pc);
        }
        if (!worldBox.isEmpty()) {
          minimapRdr.setBounds(worldBox);
        }
      }
      if ((config.basemap?.crs || config.basemap?.georeference) && !loader.worldBox.isEmpty()) {
        basemap.build(loader.worldBox, config.basemap).then(() => {
          if (basemap.isBuilt()) setBasemapAvailable(true);
        }).catch(console.error);
      }
    }).catch(console.error);
    return () => {
      sm.removeFrameCallback(minimapFrame);
      sm.removePostRenderCallback(axisFrame);
      sm.dispose();
      measureMgr.dispose();
      markerMgr.dispose();
      minimapRdr.dispose();
      basemap.dispose();
      clipMgr.dispose();
      axisWidget.dispose();
      initialized.current = false;
    };
  }, []);
  useEffect(() => {
    if (minimapRef.current && minimapContainerRef.current) {
      minimapRef.current.attach(minimapContainerRef.current);
    }
  }, [showMinimap]);
  const handleMinimapClick = useCallback((e) => {
    const sm = smRef.current;
    const minimap = minimapRef.current;
    if (!sm || !minimap) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const world = minimap.canvasToWorld(cx, cy);
    const cam = sm.camera;
    const offset = new THREE5.Vector3().subVectors(cam.position, sm.controls.target);
    sm.controls.target.set(world.x, world.y, sm.controls.target.z);
    cam.position.set(world.x + offset.x, world.y + offset.y, cam.position.z);
    sm.controls.update();
  }, []);
  const minimapResizeRef = useRef(false);
  const handleMinimapResizeStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    minimapResizeRef.current = true;
    const startY = e.clientY;
    const startSize = minimapSize;
    const onMove = (ev) => {
      if (!minimapResizeRef.current) return;
      const delta = startY - ev.clientY;
      setMinimapSize(Math.max(120, Math.min(400, startSize + delta)));
      minimapRef.current?.resize();
    };
    const onUp = () => {
      minimapResizeRef.current = false;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setTimeout(() => minimapRef.current?.resize(), 0);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [minimapSize]);
  useEffect(() => {
    if (markerRef.current && cameras.length > 0) {
      const wb = loaderRef.current?.worldBox;
      markerRef.current.build(cameras, wb && !wb.isEmpty() ? wb : void 0);
      markerRef.current.setVisible(showMarkers);
    }
  }, [cameras, showMarkers]);
  useEffect(() => {
    markerRef.current?.setVisible(showMarkers);
  }, [showMarkers]);
  useEffect(() => {
    measureRef.current?.setVisible(showMeasurements);
  }, [showMeasurements]);
  useEffect(() => {
    basemapRef.current?.setVisible(showBasemap);
  }, [showBasemap]);
  useEffect(() => {
    const mm = markerRef.current;
    const cm = clipRef.current;
    if (!mm) return;
    mm.applyClipFilter(cm ? (p) => cm.isPointVisible(p) : null);
  }, [clipBoxEntries]);
  const magnifierTool = activeTool.startsWith("measure-") && activeTool !== "measure-volume";
  useEffect(() => {
    if (!activeTool.startsWith("measure-")) {
      measureRef.current?.clearSnap();
    }
    if (activeTool !== "measure-volume") {
      volumeDragRef.current = null;
      measureRef.current?.setVolumeDraft(null);
    }
    if (activeTool !== "section-box") {
      clipDraftRef.current = null;
      clipDownRef.current = null;
      clipRef.current?.setDraft(null);
    }
    if (!magnifierTool) setMagnifierOn(false);
  }, [activeTool, magnifierTool]);
  useEffect(() => {
    smRef.current?.setNavigationMode(navigationMode);
  }, [navigationMode]);
  useEffect(() => {
    smRef.current?.setProjection(projection);
  }, [projection]);
  useEffect(() => {
    measureRef.current?.applyDisplaySettings(displaySettings);
    markerRef.current?.applyDisplaySettings(displaySettings);
  }, [displaySettings]);
  const projectToPlaneZ = useCallback((nx, ny, planeZ) => {
    const sm = smRef.current;
    if (!sm) return null;
    const raycaster = new THREE5.Raycaster();
    raycaster.setFromCamera(new THREE5.Vector2(nx, ny), sm.camera);
    const plane = new THREE5.Plane(new THREE5.Vector3(0, 0, 1), -planeZ);
    const hit = new THREE5.Vector3();
    return raycaster.ray.intersectPlane(plane, hit) ? hit : null;
  }, []);
  const pickVisiblePoint = useCallback((nx, ny) => {
    const sm = smRef.current;
    if (!sm) return null;
    const picked = sm.pickPoint(nx, ny);
    if (picked && (!clipRef.current || clipRef.current.isPointVisible(picked))) {
      return picked;
    }
    return projectToPlaneZ(nx, ny, sm.controls.target.z);
  }, [projectToPlaneZ]);
  const drawLoupe = useCallback((hit) => {
    const sm = smRef.current;
    const src = sm?.renderer.domElement;
    const loupe = loupeCanvasRef.current;
    if (!sm || !src || !loupe) return;
    const ctx = loupe.getContext("2d");
    if (!ctx) return;
    const ndc = hit.clone().project(sm.camera);
    const bufX = (ndc.x * 0.5 + 0.5) * src.width;
    const bufY = (1 - (ndc.y * 0.5 + 0.5)) * src.height;
    const ratio = src.clientWidth > 0 ? src.width / src.clientWidth : 1;
    const srcSize = LOUPE_SIZE / LOUPE_ZOOM * ratio;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);
    try {
      ctx.drawImage(
        src,
        bufX - srcSize / 2,
        bufY - srcSize / 2,
        srcSize,
        srcSize,
        0,
        0,
        LOUPE_SIZE,
        LOUPE_SIZE
      );
    } catch {
    }
  }, []);
  const buildClipDraftAt = useCallback((nx, ny) => {
    const sm = smRef.current;
    if (!sm) return null;
    const zMid = metaZRef.current ? (metaZRef.current.min + metaZRef.current.max) / 2 : sm.controls.target.z;
    const center = projectToPlaneZ(nx, ny, zMid);
    if (!center) return null;
    const wb = loaderRef.current?.worldBox;
    const bounds = new THREE5.Vector3(20, 20, 20);
    if (wb && !wb.isEmpty()) wb.getSize(bounds);
    const half = new THREE5.Vector3(
      Math.max(0.1, Math.min(bounds.x, bounds.x / 4)) / 2,
      Math.max(0.1, Math.min(bounds.y, bounds.y / 4)) / 2,
      Math.max(0.2, Math.min(bounds.z, bounds.z / 12, 8)) / 2
    );
    return new THREE5.Box3(
      center.clone().sub(half),
      center.clone().add(half)
    );
  }, [projectToPlaneZ]);
  const getNDC = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      nx: (e.clientX - rect.left) / rect.width * 2 - 1,
      ny: -((e.clientY - rect.top) / rect.height) * 2 + 1
    };
  };
  const handleDblClick = useCallback((e) => {
    const sm = smRef.current;
    const anim = animRef.current;
    if (!sm || !anim) return;
    const { nx, ny } = getNDC(e);
    const hit = sm.pickPoint(nx, ny) ?? projectToPlaneZ(nx, ny, sm.controls.target.z);
    if (!hit) return;
    anim.flyTo({ position: sm.camera.position.clone(), target: hit, duration: 600 });
  }, [projectToPlaneZ]);
  const handleMouseDown = useCallback((e) => {
    const sm = smRef.current;
    if (!sm) return;
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isAttached() && e.button === 0) {
      if (fh.onPointerDown(e.clientX, e.clientY)) {
        e.preventDefault();
        sm.controls.enabled = false;
        return;
      }
    }
    if (activeTool === "measure-volume" && e.button === 0) {
      const vd = volumeDragRef.current;
      if (vd && vd.phase === "height") {
        if (vd.footprintBox) {
          measureRef.current?.addVolumeMeasurement(vd.footprintBox);
        }
        volumeDragRef.current = null;
        sm.controls.enabled = true;
        return;
      }
      e.preventDefault();
      sm.controls.enabled = false;
      const { nx, ny } = getNDC(e);
      const planeZ = sm.controls.target.z;
      const startWorld = projectToPlaneZ(nx, ny, planeZ);
      if (startWorld) {
        volumeDragRef.current = { phase: "footprint", startWorld, planeZ };
      }
      return;
    }
    if (activeTool !== "section-box" || e.button !== 0) return;
    clipDownRef.current = { x: e.clientX, y: e.clientY };
  }, [activeTool]);
  const handleMouseMove = useCallback((e) => {
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerMove(e.clientX, e.clientY);
      return;
    }
    if (fh && fh.isAttached()) {
      fh.updateHover(e.clientX, e.clientY);
    }
    const vd = volumeDragRef.current;
    if (vd && activeTool === "measure-volume") {
      if (vd.phase === "footprint") {
        const { nx, ny } = getNDC(e);
        const endWorld = projectToPlaneZ(nx, ny, vd.planeZ);
        if (!endWorld) return;
        const { startWorld } = vd;
        const zMin = metaZRef.current?.min ?? vd.planeZ - 10;
        const zMax = metaZRef.current?.max ?? vd.planeZ + 10;
        const box = new THREE5.Box3(
          new THREE5.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
          new THREE5.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax)
        );
        measureRef.current?.setVolumeDraft(box);
      } else if (vd.phase === "height" && vd.footprintBox && vd.startClientY !== void 0) {
        const deltaY = vd.startClientY - e.clientY;
        const sensitivity = 0.1;
        const zExtent = Math.max(0.1, Math.abs(deltaY) * sensitivity);
        const midZ = (vd.baseZMin + vd.baseZMax) / 2;
        const box = vd.footprintBox.clone();
        box.min.z = midZ - zExtent / 2;
        box.max.z = midZ + zExtent / 2;
        vd.footprintBox.copy(box);
        measureRef.current?.setVolumeDraft(box);
      }
      return;
    }
    if (activeTool === "section-box") {
      const { nx, ny } = getNDC(e);
      const box = buildClipDraftAt(nx, ny);
      clipDraftRef.current = box;
      clipRef.current?.setDraft(box);
      return;
    }
    if (activeTool.startsWith("measure-") && measureRef.current) {
      const sm = smRef.current;
      if (!sm) return;
      const { nx, ny } = getNDC(e);
      const hit = pickVisiblePoint(nx, ny);
      if (hit) {
        measureRef.current.updateSnap(hit);
        if (magnifierTool) {
          drawLoupe(hit);
          const rect = e.currentTarget.getBoundingClientRect();
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          let px = cx + LOUPE_OFFSET;
          let py = cy + LOUPE_OFFSET;
          if (px + LOUPE_SIZE > rect.width) px = cx - LOUPE_OFFSET - LOUPE_SIZE;
          if (py + LOUPE_SIZE > rect.height) py = cy - LOUPE_OFFSET - LOUPE_SIZE;
          setLoupePos({ x: Math.max(4, px), y: Math.max(4, py) });
          if (!magnifierOn) setMagnifierOn(true);
        }
      }
    }
  }, [activeTool, pickVisiblePoint, buildClipDraftAt, magnifierTool, magnifierOn, drawLoupe]);
  const handleMouseUp = useCallback((e) => {
    const sm = smRef.current;
    const fh = clipRef.current?.faceHandles;
    if (fh && fh.isDragging()) {
      fh.onPointerUp();
      if (sm) sm.controls.enabled = true;
      return;
    }
    const vdUp = volumeDragRef.current;
    if (vdUp && vdUp.phase === "footprint" && activeTool === "measure-volume") {
      const { nx, ny } = getNDC(e);
      const endWorld = projectToPlaneZ(nx, ny, vdUp.planeZ);
      if (endWorld) {
        const { startWorld } = vdUp;
        const zMin = metaZRef.current?.min ?? vdUp.planeZ - 10;
        const zMax = metaZRef.current?.max ?? vdUp.planeZ + 10;
        const box = new THREE5.Box3(
          new THREE5.Vector3(Math.min(startWorld.x, endWorld.x), Math.min(startWorld.y, endWorld.y), zMin),
          new THREE5.Vector3(Math.max(startWorld.x, endWorld.x), Math.max(startWorld.y, endWorld.y), zMax)
        );
        if (!box.isEmpty()) {
          volumeDragRef.current = {
            phase: "height",
            startWorld: vdUp.startWorld,
            planeZ: vdUp.planeZ,
            footprintBox: box,
            startClientY: e.clientY,
            baseZMin: zMin,
            baseZMax: zMax
          };
          return;
        }
      }
      volumeDragRef.current = null;
      measureRef.current?.setVolumeDraft(null);
      if (sm) sm.controls.enabled = true;
      return;
    }
    if (sm) sm.controls.enabled = true;
    if (activeTool === "section-box" && e.button === 0) {
      const down = clipDownRef.current;
      clipDownRef.current = null;
      const DRAG_THRESHOLD = 5;
      const moved = down ? Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_THRESHOLD : true;
      if (!moved) {
        const { nx, ny } = getNDC(e);
        const box = clipDraftRef.current ?? buildClipDraftAt(nx, ny);
        if (box && !box.isEmpty() && clipRef.current) {
          const entry = clipRef.current.addBox(box);
          clipRef.current.selectBox(entry.id);
          clipDraftRef.current = null;
          clipRef.current.setDraft(null);
        }
      }
      return;
    }
  }, [activeTool, buildClipDraftAt]);
  const handleClick = useCallback((e) => {
    if (activeTool === "section-box") return;
    const sm = smRef.current;
    if (!sm) return;
    const { nx, ny } = getNDC(e);
    if (activeTool === "none" && showMarkers && markerRef.current) {
      const hits = sm.raycast(nx, ny, markerRef.current.getMeshes());
      if (hits.length > 0) {
        const idx = hits[0].object.userData.cameraIndex;
        markerRef.current.setSelected(idx);
        setSelectedCamera(cameras[idx]);
        config.onCameraSelect?.(cameras[idx]);
      }
    }
    if (activeTool.startsWith("measure-") && activeTool !== "measure-volume" && measureRef.current) {
      const type = activeTool.replace("measure-", "");
      const hit = pickVisiblePoint(nx, ny);
      if (hit) {
        if (!measureRef.current.activeMeasurement) measureRef.current.start(type);
        measureRef.current.addPoint(hit);
      }
    }
  }, [activeTool, cameras, config, pickVisiblePoint, showMarkers]);
  const handleMouseLeave = useCallback(() => {
    measureRef.current?.clearSnap();
    setMagnifierOn(false);
  }, []);
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    if (volumeDragRef.current) {
      volumeDragRef.current = null;
      measureRef.current?.setVolumeDraft(null);
      const sm = smRef.current;
      if (sm) sm.controls.enabled = true;
      return;
    }
    if (activeTool.startsWith("measure-") && measureRef.current?.activeMeasurement) {
      measureRef.current.finish();
    }
    if (activeTool === "section-box") {
      clipDraftRef.current = null;
      clipDownRef.current = null;
      clipRef.current?.setDraft(null);
      clipRef.current?.clear();
    }
  }, [activeTool]);
  return /* @__PURE__ */ jsxs("div", { className: cn("relative w-full h-full overflow-hidden bg-[hsl(var(--viewport-bg))]", className), children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        ref: containerRef,
        className: "w-full h-full select-none",
        onClick: handleClick,
        onDoubleClick: handleDblClick,
        onMouseDown: handleMouseDown,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onMouseLeave: handleMouseLeave,
        onContextMenu: handleContextMenu,
        onDragStart: (e) => e.preventDefault(),
        style: {
          // Hide the OS cursor while point-snapping so only the 3D crosshair
          // shows (no doubled cross); keep a crosshair for the section tool.
          cursor: activeTool === "section-box" ? "crosshair" : activeTool.startsWith("measure-") ? "none" : "default"
        }
      }
    ),
    magnifierOn && magnifierTool && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "absolute rounded-lg overflow-hidden border border-white/20 shadow-xl pointer-events-none ring-1 ring-black/40 bg-[#0a0e1a]",
        style: { left: loupePos.x, top: loupePos.y, width: LOUPE_SIZE, height: LOUPE_SIZE },
        children: [
          /* @__PURE__ */ jsx(
            "canvas",
            {
              ref: loupeCanvasRef,
              width: LOUPE_SIZE,
              height: LOUPE_SIZE,
              className: "block w-full h-full"
            }
          ),
          /* @__PURE__ */ jsxs("svg", { width: LOUPE_SIZE, height: LOUPE_SIZE, className: "absolute inset-0", viewBox: "0 0 168 168", children: [
            /* @__PURE__ */ jsx("line", { x1: "84", y1: "58", x2: "84", y2: "78", stroke: "#DCD546", strokeWidth: "1.25" }),
            /* @__PURE__ */ jsx("line", { x1: "84", y1: "90", x2: "84", y2: "110", stroke: "#DCD546", strokeWidth: "1.25" }),
            /* @__PURE__ */ jsx("line", { x1: "58", y1: "84", x2: "78", y2: "84", stroke: "#DCD546", strokeWidth: "1.25" }),
            /* @__PURE__ */ jsx("line", { x1: "90", y1: "84", x2: "110", y2: "84", stroke: "#DCD546", strokeWidth: "1.25" }),
            /* @__PURE__ */ jsx("circle", { cx: "84", cy: "84", r: "5", fill: "none", stroke: "#DCD546", strokeWidth: "1", opacity: "0.85" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-2 text-[9px] font-mono text-white/45 select-none", children: "ZOOM" })
        ]
      }
    ),
    showMinimap && /* @__PURE__ */ jsxs(
      "div",
      {
        className: "absolute bottom-10 rounded-lg overflow-hidden border border-white/10 shadow-lg cursor-pointer transition-[right] duration-200",
        style: { width: minimapSize, height: minimapSize, right: "var(--pcv-minimap-right, 0.75rem)" },
        onClick: handleMinimapClick,
        children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              ref: minimapContainerRef,
              className: "relative w-full h-full"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "absolute top-1 left-2 text-[9px] text-white/40 font-mono pointer-events-none", children: t.overview }),
          /* @__PURE__ */ jsx(
            "div",
            {
              onMouseDown: handleMinimapResizeStart,
              className: "absolute top-0 right-0 w-4 h-4 cursor-nwse-resize flex items-center justify-center",
              title: "Resize minimap",
              children: /* @__PURE__ */ jsx("svg", { width: "8", height: "8", viewBox: "0 0 8 8", className: "text-white/30", children: /* @__PURE__ */ jsx("path", { d: "M0 8L8 0M3 8L8 3M6 8L8 6", stroke: "currentColor", strokeWidth: "1" }) })
            }
          )
        ]
      }
    ),
    activeTool !== "none" && /* @__PURE__ */ jsxs("div", { className: "absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-[hsl(var(--brand))] text-xs font-mono px-3 py-1 rounded-full pointer-events-none", children: [
      activeTool === "measure-point" && t.hintPoint,
      activeTool === "measure-distance" && t.hintDistance,
      activeTool === "measure-height" && t.hintHeight,
      activeTool === "measure-area" && t.hintArea,
      activeTool === "measure-angle" && t.hintAngle,
      activeTool === "measure-volume" && (volumeDragRef.current?.phase === "height" ? "Move mouse up/down to set height, click to confirm" : "Drag to draw volume footprint"),
      activeTool === "section-box" && t.hintSectionBox
    ] }),
    metadata && /* @__PURE__ */ jsxs("div", { className: "absolute top-3 left-3 text-[10px] font-mono text-white/30 pointer-events-none", children: [
      (metadata.points / 1e6).toFixed(1),
      "M pts"
    ] }),
    showBasemap && /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 right-2 text-[9px] text-white/50 bg-black/40 px-1.5 py-0.5 rounded pointer-events-none", children: config.basemap?.attribution ?? "\xA9 OpenStreetMap contributors \xA9 CARTO" })
  ] });
}
var LOUPE_SIZE, LOUPE_ZOOM, LOUPE_OFFSET;
var init_viewport = __esm({
  "src/components/viewport.tsx"() {
    "use client";
    init_utils();
    init_viewer_provider();
    init_data_provider();
    init_locale_context();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    init_dist();
    LOUPE_SIZE = 168;
    LOUPE_ZOOM = 7;
    LOUPE_OFFSET = 22;
  }
});

// src/index.ts
init_dist();
var ThemeContext = createContext(null);
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
function ThemeProvider({
  defaultTheme = "dark",
  storageKey = "pcv-theme",
  children
}) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return defaultTheme;
    return localStorage.getItem(storageKey) ?? defaultTheme;
  });
  const [, forceUpdate] = useReducer((n) => n + 1, 0);
  const resolvedTheme = theme === "system" ? typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : theme;
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", forceUpdate);
    return () => mq.removeEventListener("change", forceUpdate);
  }, [theme]);
  const setTheme = (t) => {
    setThemeState(t);
    if (typeof window !== "undefined") localStorage.setItem(storageKey, t);
  };
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value: { theme, resolvedTheme, setTheme, toggleTheme }, children });
}

// src/components/pano-cloud-viewer.tsx
init_viewer_provider();
init_data_provider();
init_locale_context();

// src/components/workspace-layout.tsx
init_utils();
init_viewer_provider();
init_data_provider();
init_locale_context();

// src/components/toolbar/main-toolbar.tsx
init_utils();
init_viewer_provider();
init_locale_context();

// src/components/toolbar/view-controls.tsx
init_viewer_provider();
init_locale_context();
var CUBE_WIRE = /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("path", { d: "M12 2L22 8V16L12 22L2 16V8Z", stroke: "currentColor", strokeWidth: "1.2", strokeLinejoin: "round", fill: "none" }),
  /* @__PURE__ */ jsx("path", { d: "M12 12L22 8", stroke: "currentColor", strokeWidth: "1.2" }),
  /* @__PURE__ */ jsx("path", { d: "M12 12L2 8", stroke: "currentColor", strokeWidth: "1.2" }),
  /* @__PURE__ */ jsx("path", { d: "M12 12V22", stroke: "currentColor", strokeWidth: "1.2" })
] });
function TopIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M2 8L12 2L22 8L12 12Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function BottomIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M2 16L12 22L22 16L12 12Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function FrontIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M2 8L12 12V22L2 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function BackIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M22 8L12 12V22L22 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function LeftIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M2 8L12 2V12L2 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
function RightIcon() {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", width: "14", height: "14", children: [
    CUBE_WIRE,
    /* @__PURE__ */ jsx("path", { d: "M22 8L12 2V12L22 16Z", fill: "currentColor", fillOpacity: "0.35" })
  ] });
}
var VIEW_DEFS = [
  { titleKey: "viewTop", pos: [0, 0, 1], up: [0, 1, 0], icon: TopIcon },
  { titleKey: "viewBottom", pos: [0, 0, -1], up: [0, 1, 0], icon: BottomIcon },
  { titleKey: "viewFront", pos: [0, -1, 0], up: [0, 0, 1], icon: FrontIcon },
  { titleKey: "viewBack", pos: [0, 1, 0], up: [0, 0, 1], icon: BackIcon },
  { titleKey: "viewLeft", pos: [-1, 0, 0], up: [0, 0, 1], icon: LeftIcon },
  { titleKey: "viewRight", pos: [1, 0, 0], up: [0, 0, 1], icon: RightIcon }
];
function ViewControls() {
  const { sceneManager } = useViewer();
  const t = useLocale().toolbar;
  const flyToView = (pos, up) => {
    if (!sceneManager) return;
    const { camera, controls } = sceneManager;
    const target = controls.target.clone();
    const dist = camera.position.distanceTo(target);
    const newPos = target.clone().add(
      { x: pos[0] * dist, y: pos[1] * dist, z: pos[2] * dist }
    );
    camera.position.set(newPos.x, newPos.y, newPos.z);
    camera.up.set(up[0], up[1], up[2]);
    controls.update();
  };
  return /* @__PURE__ */ jsx(Fragment, { children: VIEW_DEFS.map((v) => /* @__PURE__ */ jsx(
    ToolbarIconBtn,
    {
      icon: /* @__PURE__ */ jsx(v.icon, {}),
      title: t[v.titleKey] ?? v.titleKey,
      active: false,
      onClick: () => flyToView(v.pos, v.up)
    },
    v.titleKey
  )) });
}

// src/components/toolbar/display-controls.tsx
init_viewer_provider();
init_locale_context();
var COLOR_MODES = [
  { value: "rgb", labelKey: "colorRgb" },
  { value: "height", labelKey: "colorElevation" },
  { value: "intensity", labelKey: "colorIntensity" },
  { value: "intensity_gradient", labelKey: "colorIntensityGradient" },
  { value: "classification", labelKey: "colorClassification" },
  { value: "return_number", labelKey: "colorReturnNumber" },
  { value: "source", labelKey: "colorSource" }
];
var QUALITY_PRESETS = [
  { value: "performance", shape: 0, sizeType: 0, label: "qualityPerformance" },
  // SQUARE + FIXED
  { value: "balanced", shape: 1, sizeType: 2, label: "qualityBalanced" },
  // CIRCLE + ADAPTIVE
  { value: "high", shape: 2, sizeType: 2, label: "qualityHigh" }
  // PARABOLOID + ADAPTIVE
];
function OrbitIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("path", { d: "M5 8l7-4 7 4v8l-7 4-7-4V8z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M5 8l7 4 7-4", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M12 12v8", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("path", { d: "M20 5a9.5 9.5 0 0 0-4-2.5", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M20 5l-1.5-2M20 5l2-1", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round" })
  ] });
}
function FreeIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("path", { d: "M7 9l5-3 5 3v6l-5 3-5-3V9z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M7 9l5 3 5-3", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M12 12v6", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("path", { d: "M4 8a8.5 8.5 0 0 1 2-3", stroke: "currentColor", strokeWidth: "1.3", strokeLinecap: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M4 8l-1.5-1.5M4 8l1.5-2", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round" })
  ] });
}
function PanIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("path", { d: "M5 8l7-4 7 4v8l-7 4-7-4V8z", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M5 8l7 4 7-4", stroke: "currentColor", strokeWidth: "1.3", strokeLinejoin: "round" }),
    /* @__PURE__ */ jsx("path", { d: "M12 12v8", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("path", { d: "M5 8l7-4 7 4-7 4z", fill: "currentColor", fillOpacity: "0.25" }),
    /* @__PURE__ */ jsx("path", { d: "M3 20h4M3 20l1.5-1.5M3 20l1.5 1.5", stroke: "currentColor", strokeWidth: "1", strokeLinecap: "round" })
  ] });
}
function PerspectiveIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("rect", { x: "3", y: "4", width: "12", height: "12", rx: "0.5", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("rect", { x: "9", y: "7", width: "12", height: "12", rx: "0.5", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "3", y1: "4", x2: "9", y2: "7", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "15", y1: "4", x2: "21", y2: "7", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "3", y1: "16", x2: "9", y2: "19", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "15", y1: "16", x2: "21", y2: "19", stroke: "currentColor", strokeWidth: "1.3" })
  ] });
}
function OrthoIcon({ className }) {
  return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 24 24", fill: "none", className, width: "14", height: "14", children: [
    /* @__PURE__ */ jsx("rect", { x: "4", y: "4", width: "10", height: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("rect", { x: "10", y: "10", width: "10", height: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "4", y1: "4", x2: "10", y2: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "14", y1: "4", x2: "20", y2: "10", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "4", y1: "14", x2: "10", y2: "20", stroke: "currentColor", strokeWidth: "1.3" }),
    /* @__PURE__ */ jsx("line", { x1: "14", y1: "14", x2: "20", y2: "20", stroke: "currentColor", strokeWidth: "1.3" })
  ] });
}
var NAV_MODES = [
  { value: "orbit", icon: OrbitIcon, titleKey: "navOrbitTitle" },
  { value: "free", icon: FreeIcon, titleKey: "navFreeTitle" },
  { value: "pan", icon: PanIcon, titleKey: "navPanTitle" }
];
var PROJ_MODES = [
  { value: "perspective", icon: PerspectiveIcon, titleKey: "camPerspectiveTitle" },
  { value: "orthographic", icon: OrthoIcon, titleKey: "camOrthographicTitle" }
];
var iconBtnClass = (active) => `p-1 rounded transition-colors cursor-pointer border ${active ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] border-[hsl(var(--brand)/0.4)]" : "text-muted-foreground hover:text-foreground border-transparent hover:border-[hsl(var(--border))]"}`;
function ViewModeControls() {
  const { navigationMode, setNavigationMode, projection, setProjection } = useViewer();
  const t = useLocale().toolbar;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 px-1", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5 border border-[hsl(var(--border))] rounded p-0.5", children: NAV_MODES.map((nm) => /* @__PURE__ */ jsx(
      "button",
      {
        className: iconBtnClass(navigationMode === nm.value),
        title: t[nm.titleKey],
        onClick: () => setNavigationMode(nm.value),
        children: /* @__PURE__ */ jsx(nm.icon, {})
      },
      nm.value
    )) }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-0.5 border border-[hsl(var(--border))] rounded p-0.5", children: PROJ_MODES.map((pm) => /* @__PURE__ */ jsx(
      "button",
      {
        className: iconBtnClass(projection === pm.value),
        title: t[pm.titleKey],
        onClick: () => setProjection(pm.value),
        children: /* @__PURE__ */ jsx(pm.icon, {})
      },
      pm.value
    )) })
  ] });
}
function DisplayControls() {
  const { pointBudget, setPointBudget, pointSize, setPointSize, loader, colorMode, setColorMode, uiMode } = useViewer();
  const t = useLocale().toolbar;
  const [quality, setQuality] = useState("balanced");
  const isPro = uiMode === "professional";
  const handleBudget = (e) => {
    const val = Number(e.target.value);
    setPointBudget(val);
    loader?.setPointBudget(val);
  };
  const handleSize = (e) => {
    const val = Number(e.target.value);
    setPointSize(val);
    loader?.setPointSize(val);
  };
  const handleColorMode = async (e) => {
    const mode2 = e.target.value;
    setColorMode(mode2);
    await loader?.setColorMode(mode2);
  };
  const handleQuality = (e) => {
    const preset = QUALITY_PRESETS.find((p) => p.value === e.target.value);
    if (!preset) return;
    setQuality(preset.value);
    loader?.setPointShape(preset.shape);
    loader?.setPointSizeType(preset.sizeType);
  };
  const selectClass = "bg-[hsl(var(--toolbar-bg))] border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand))] cursor-pointer";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-1", children: [
    isPro && /* @__PURE__ */ jsx(
      "select",
      {
        value: colorMode,
        onChange: handleColorMode,
        className: selectClass,
        title: t.colorMode,
        children: COLOR_MODES.map((cm) => /* @__PURE__ */ jsx("option", { value: cm.value, children: t[cm.labelKey] ?? cm.value }, cm.value))
      }
    ),
    isPro && /* @__PURE__ */ jsx(
      "select",
      {
        value: quality,
        onChange: handleQuality,
        className: selectClass,
        title: t.quality,
        children: QUALITY_PRESETS.map((q) => /* @__PURE__ */ jsx("option", { value: q.value, children: t[q.label] ?? q.value }, q.value))
      }
    ),
    isPro && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono", children: [
      /* @__PURE__ */ jsx("span", { className: "hidden lg:block", children: t.budget }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          min: 5e5,
          max: 1e7,
          step: 1e5,
          value: pointBudget,
          onChange: handleBudget,
          className: "pcv-slider w-16",
          title: t.pointBudgetTitle(pointBudget / 1e6)
        }
      ),
      /* @__PURE__ */ jsxs("span", { className: "w-8 text-right tabular-nums", children: [
        (pointBudget / 1e6).toFixed(0),
        "M"
      ] })
    ] }),
    isPro && /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono", children: [
      /* @__PURE__ */ jsx("span", { className: "hidden lg:block", children: t.size }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "range",
          min: 0.5,
          max: 5,
          step: 0.1,
          value: pointSize,
          onChange: handleSize,
          className: "pcv-slider w-12",
          title: t.pointSizeTitle(pointSize)
        }
      )
    ] })
  ] });
}

// src/components/toolbar/export-tools.tsx
init_viewer_provider();
init_locale_context();
init_dist();
function ExportTools() {
  const { exporter } = useViewer();
  const t = useLocale().exportPanel;
  const pcvRoot = usePcvRoot();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("top");
  const [scale, setScale] = useState(2);
  const [bg, setBg] = useState("white");
  const [fmt, setFmt] = useState("png");
  const [exporting, setExporting] = useState(false);
  const btnRef = useRef(null);
  const popoverRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
  }, [open]);
  const handleClickOutside = useCallback((e) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target) && btnRef.current && !btnRef.current.contains(e.target)) {
      setOpen(false);
    }
  }, []);
  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);
  const doExport = async () => {
    if (!exporter) return;
    setExporting(true);
    try {
      const url = await exporter.capture({ view, scale, background: bg, showScaleBar: false, format: fmt });
      const date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      ExportManager.download(url, `pointcloud_${view}_${date}.${fmt}`);
    } finally {
      setExporting(false);
      setOpen(false);
    }
  };
  const views = [
    { value: "top", label: t.viewTop },
    { value: "front", label: t.viewFront },
    { value: "side", label: t.viewSide },
    { value: "back", label: t.viewBack }
  ];
  const bgLabels = {
    white: t.bgWhite,
    black: t.bgBlack,
    transparent: t.bgTransparent
  };
  return /* @__PURE__ */ jsxs("div", { ref: btnRef, children: [
    /* @__PURE__ */ jsx(
      ToolbarIconBtn,
      {
        icon: /* @__PURE__ */ jsx(Download, { size: 14 }),
        title: t.exportImageTitle,
        active: open,
        onClick: () => setOpen(!open)
      }
    ),
    open && createPortal(
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref: popoverRef,
          style: { position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 },
          className: "bg-[hsl(var(--popover))] border border-[hsl(var(--border))] rounded-lg shadow-xl p-3 w-52 text-xs text-foreground",
          children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold mb-2 text-[hsl(var(--brand))]", children: t.title }),
            /* @__PURE__ */ jsx("label", { className: "block mb-1 text-muted-foreground", children: t.view }),
            /* @__PURE__ */ jsx(
              "select",
              {
                value: view,
                onChange: (e) => setView(e.target.value),
                className: "w-full mb-2 bg-muted text-foreground rounded px-1 py-0.5 text-xs border border-[hsl(var(--border))]",
                children: views.map((v) => /* @__PURE__ */ jsx("option", { value: v.value, children: v.label }, v.value))
              }
            ),
            /* @__PURE__ */ jsx("label", { className: "block mb-1 text-muted-foreground", children: t.scale }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-2", children: [1, 2, 4].map((s) => /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setScale(s),
                className: `flex-1 py-0.5 rounded text-xs border transition-colors ${scale === s ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`,
                children: [
                  s,
                  "x"
                ]
              },
              s
            )) }),
            /* @__PURE__ */ jsx("label", { className: "block mb-1 text-muted-foreground", children: t.background }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-2", children: ["white", "black", "transparent"].map((b) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setBg(b),
                className: `flex-1 py-0.5 rounded text-xs border transition-colors ${bg === b ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`,
                children: bgLabels[b]
              },
              b
            )) }),
            /* @__PURE__ */ jsx("label", { className: "block mb-1 text-muted-foreground", children: t.format }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-1 mb-3", children: ["png", "jpeg"].map((f) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setFmt(f),
                className: `flex-1 py-0.5 rounded text-xs border transition-colors uppercase ${fmt === f ? "border-[hsl(var(--brand))] text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.15)]" : "border-[hsl(var(--border))] text-muted-foreground hover:text-foreground"}`,
                children: f
              },
              f
            )) }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: doExport,
                disabled: exporting,
                className: "w-full py-1.5 bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))] rounded font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity",
                children: exporting ? t.exporting : t.download
              }
            )
          ]
        }
      ),
      pcvRoot?.current ?? document.body
    )
  ] });
}
function ToolbarSection({ label, children, className }) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-0.5 px-2 border-r border-[hsl(var(--toolbar-border))] last:border-r-0", className), children: [
    children,
    label && /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground/50 ml-1 hidden xl:block font-mono uppercase tracking-wider", children: label })
  ] });
}
function MainToolbar({ onOpenCloudSelector, onToggleRenderSettings, onToggleQuickSettings, renderSettingsOpen, quickSettingsOpen }) {
  const { uiMode } = useViewer();
  const { resolvedTheme, toggleTheme } = useTheme();
  const t = useLocale().toolbar;
  const isPro = uiMode === "professional";
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center h-10 px-2 gap-0 select-none overflow-x-auto", children: [
    /* @__PURE__ */ jsxs(ToolbarSection, { label: "Views", children: [
      /* @__PURE__ */ jsx(ViewControls, {}),
      /* @__PURE__ */ jsx(ViewModeControls, {})
    ] }),
    /* @__PURE__ */ jsxs(ToolbarSection, { label: "Display", children: [
      /* @__PURE__ */ jsx(DisplayControls, {}),
      isPro && /* @__PURE__ */ jsx(
        ToolbarIconBtn,
        {
          icon: /* @__PURE__ */ jsx(Settings, { size: 14 }),
          active: quickSettingsOpen,
          onClick: onToggleQuickSettings,
          title: "Quick settings"
        }
      ),
      isPro && /* @__PURE__ */ jsx(
        ToolbarIconBtn,
        {
          icon: /* @__PURE__ */ jsx(Sliders, { size: 14 }),
          active: renderSettingsOpen,
          onClick: onToggleRenderSettings,
          title: "Rendering settings"
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsxs(ToolbarSection, { children: [
      isPro && /* @__PURE__ */ jsx(ExportTools, {}),
      isPro && /* @__PURE__ */ jsx(
        ToolbarIconBtn,
        {
          icon: /* @__PURE__ */ jsx(Layers, { size: 14 }),
          label: t.clouds,
          active: false,
          onClick: onOpenCloudSelector,
          title: t.cloudSelector
        }
      ),
      /* @__PURE__ */ jsx(
        ToolbarIconBtn,
        {
          icon: resolvedTheme === "dark" ? /* @__PURE__ */ jsx(Sun, { size: 14 }) : /* @__PURE__ */ jsx(Moon, { size: 14 }),
          label: t.theme,
          active: false,
          onClick: toggleTheme,
          title: resolvedTheme === "dark" ? t.switchToLight : t.switchToDark
        }
      )
    ] })
  ] });
}
function ToolbarIconBtn({ icon, label, active, onClick, title }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      title,
      onClick,
      className: cn(
        "flex items-center gap-1 px-1.5 py-1 rounded text-xs transition-colors",
        active ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      ),
      children: [
        icon,
        label && /* @__PURE__ */ jsx("span", { className: "hidden xl:block", children: label })
      ]
    }
  );
}

// src/components/toolbar/tool-rail.tsx
init_utils();
init_viewer_provider();
init_locale_context();
function RailBtn({ icon, title, active, onClick, disabled, compact }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      title,
      onClick,
      disabled,
      className: cn(
        "flex items-center justify-center rounded transition-colors",
        compact ? "w-7 h-7" : "w-9 h-9",
        active ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
        disabled && "opacity-30 cursor-not-allowed"
      ),
      children: icon
    }
  );
}
function Divider() {
  return /* @__PURE__ */ jsx("div", { className: "h-px w-6 mx-auto bg-[hsl(var(--border))] my-0.5" });
}
function GroupLabel({ children }) {
  return /* @__PURE__ */ jsx("span", { className: "text-[8px] font-mono uppercase tracking-widest text-muted-foreground/50 text-center leading-none mt-1", children });
}
var BASIC_MEASURES = [
  { type: "point", tool: "measure-point", icon: /* @__PURE__ */ jsx(MapPin, { size: 15 }), titleKey: "measurePoint" },
  { type: "distance", tool: "measure-distance", icon: /* @__PURE__ */ jsx(Ruler, { size: 15 }), titleKey: "measureDistance" },
  { type: "height", tool: "measure-height", icon: /* @__PURE__ */ jsx(ArrowUpDown, { size: 15 }), titleKey: "measureHeight" }
];
var ADVANCED_MEASURES = [
  { type: "area", tool: "measure-area", icon: /* @__PURE__ */ jsx(Pentagon, { size: 15 }), titleKey: "measureArea" },
  { type: "volume", tool: "measure-volume", icon: /* @__PURE__ */ jsx(Package, { size: 15 }), titleKey: "measureVolume" },
  { type: "angle", tool: "measure-angle", icon: /* @__PURE__ */ jsx(Triangle, { size: 15 }), titleKey: "measureAngle" },
  { type: "profile", tool: "measure-profile", icon: /* @__PURE__ */ jsx(Waypoints, { size: 15 }), titleKey: "measureProfile" }
];
function ToolRail() {
  const { activeTool, setActiveTool, clipManager, loader, measurementManager, setMeasurementList, uiMode, selectedClipBoxId } = useViewer();
  const t = useLocale().toolRail;
  const isPro = uiMode === "professional";
  const toggle = (tool) => setActiveTool(activeTool === tool ? "none" : tool);
  const boxes = clipManager?.getBoxes() ?? [];
  const hasClipBox = boxes.length > 0;
  const clipSelected = !!selectedClipBoxId;
  const toggleClipBox = () => {
    if (!clipManager || !loader) return;
    if (!hasClipBox) {
      if (loader.worldBox.isEmpty()) return;
      const entry = clipManager.addDefaultBox(loader.worldBox);
      clipManager.selectBox(entry.id);
    } else if (clipSelected) {
      clipManager.selectBox(null);
    } else {
      clipManager.selectBox(boxes[0].id);
    }
  };
  const clearClipBox = () => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  };
  const clearMeasurements = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5 py-2 px-1 w-10 shrink-0", children: [
    /* @__PURE__ */ jsx(GroupLabel, { children: t.measureGroup }),
    BASIC_MEASURES.map((def) => /* @__PURE__ */ jsx(
      RailBtn,
      {
        icon: def.icon,
        title: t[def.titleKey] ?? def.type,
        active: activeTool === def.tool,
        onClick: () => toggle(def.tool)
      },
      def.tool
    )),
    isPro && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Divider, {}),
      ADVANCED_MEASURES.map((def) => /* @__PURE__ */ jsx(
        RailBtn,
        {
          icon: def.icon,
          title: t[def.titleKey] ?? def.type,
          active: activeTool === def.tool,
          onClick: () => toggle(def.tool)
        },
        def.tool
      ))
    ] }),
    /* @__PURE__ */ jsx(
      RailBtn,
      {
        icon: /* @__PURE__ */ jsx(X, { size: 13 }),
        title: t.clearMeasurements,
        onClick: clearMeasurements,
        compact: true
      }
    ),
    isPro && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Divider, {}),
      /* @__PURE__ */ jsx(GroupLabel, { children: t.sectionGroup }),
      /* @__PURE__ */ jsx(
        RailBtn,
        {
          icon: /* @__PURE__ */ jsx(BoxSelect, { size: 15 }),
          title: !hasClipBox ? t.drawClipBox : clipSelected ? "Deselect section (crop stays active)" : "Edit section",
          active: clipSelected,
          onClick: toggleClipBox
        }
      ),
      hasClipBox && /* @__PURE__ */ jsx(
        RailBtn,
        {
          icon: /* @__PURE__ */ jsx(X, { size: 13 }),
          title: t.removeClipBox,
          onClick: clearClipBox,
          compact: true
        }
      )
    ] })
  ] });
}

// src/components/toolbar/clip-toolbar.tsx
init_utils();

// src/hooks/use-clip-actions.ts
init_viewer_provider();
function useClipActions() {
  const { clipManager, loader, clipBoxEntries, selectedClipBoxId, activeTool, setActiveTool } = useViewer();
  const boxes = clipBoxEntries;
  const hasClipBox = boxes.length > 0;
  const clipMode = boxes.find((b) => b.visible)?.mode ?? "outside";
  const addBox = useCallback(() => {
    if (!clipManager || !loader) return;
    if (loader.worldBox.isEmpty()) return;
    const entry = clipManager.addDefaultBox(loader.worldBox);
    clipManager.selectBox(entry.id);
  }, [clipManager, loader]);
  const clearAll = useCallback(() => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  }, [clipManager, activeTool, setActiveTool]);
  const toggleMode = useCallback(() => {
    const next = clipMode === "outside" ? "inside" : "outside";
    clipManager?.setModeAll(next);
  }, [clipManager, clipMode]);
  const setEnabled = useCallback((enabled) => {
    clipManager?.setEnabled(enabled);
  }, [clipManager]);
  const isEnabled = clipManager?.isEnabled() ?? true;
  const outlinesVisible = clipManager?.areOutlinesVisible() ?? true;
  const setOutlinesVisible = useCallback((visible) => {
    clipManager?.setOutlinesVisible(visible);
  }, [clipManager]);
  const selectBox = useCallback((id) => {
    clipManager?.selectBox(id);
  }, [clipManager]);
  const resetRotation = useCallback((id) => {
    clipManager?.resetRotation(id);
  }, [clipManager]);
  const setTransformMode = useCallback((mode2) => {
    if (!clipManager) return;
    if (!clipManager.getSelectedId() && boxes[0]) clipManager.selectBox(boxes[0].id);
    clipManager.setTransformMode(mode2);
  }, [clipManager, boxes]);
  const removeBox = useCallback((id) => {
    clipManager?.removeBox(id);
  }, [clipManager]);
  const setBoxVisible = useCallback((id, visible) => {
    clipManager?.setBoxVisible(id, visible);
  }, [clipManager]);
  const setModeAll = useCallback((mode2) => {
    clipManager?.setModeAll(mode2);
  }, [clipManager]);
  return {
    boxes,
    selectedBoxId: selectedClipBoxId,
    hasClipBox,
    clipMode,
    isEnabled,
    outlinesVisible,
    addBox,
    clearAll,
    toggleMode,
    setEnabled,
    setOutlinesVisible,
    selectBox,
    resetRotation,
    setTransformMode,
    removeBox,
    setBoxVisible,
    setModeAll
  };
}

// src/components/toolbar/clip-toolbar.tsx
init_locale_context();
function ClipToolbar() {
  const { boxes, selectedBoxId: selectedClipBoxId, addBox, clearAll, setModeAll, selectBox, removeBox, setBoxVisible, isEnabled, setEnabled, outlinesVisible, setOutlinesVisible, resetRotation, setTransformMode } = useClipActions();
  const t = useLocale().clipToolbar;
  const [enabled, setEnabledLocal] = React25.useState(isEnabled);
  const [outlines, setOutlinesLocal] = React25.useState(outlinesVisible);
  const [mode2, setMode] = React25.useState("scale");
  React25.useEffect(() => {
    setEnabledLocal(isEnabled);
    setOutlinesLocal(outlinesVisible);
  }, [isEnabled, outlinesVisible, boxes]);
  const TRANSFORM_MODES = [
    { m: "translate", icon: /* @__PURE__ */ jsx(Move, { size: 12 }), label: t.move },
    { m: "scale", icon: /* @__PURE__ */ jsx(Maximize2, { size: 12 }), label: t.scale },
    { m: "rotate", icon: /* @__PURE__ */ jsx(RotateCw, { size: 12 }), label: t.rotateZ }
  ];
  if (boxes.length === 0) return null;
  const firstVisible = boxes.find((b) => b.visible);
  const isInside = (firstVisible?.mode ?? "outside") === "inside";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col w-52 py-2 px-1 select-none", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1 mb-1.5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs font-semibold text-foreground", children: [
        /* @__PURE__ */ jsx(BoxSelect, { size: 13, className: "text-[hsl(var(--brand))]" }),
        /* @__PURE__ */ jsx("span", { children: t.title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-0.5", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            title: t.addBox,
            onClick: addBox,
            className: "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
            children: [
              /* @__PURE__ */ jsx(Plus, { size: 12 }),
              /* @__PURE__ */ jsx("span", { className: "text-[11px]", children: t.addBox })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            title: t.clearAll,
            onClick: clearAll,
            className: "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-destructive/20 hover:text-destructive transition-colors",
            children: /* @__PURE__ */ jsx(Trash2, { size: 12 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "h-px bg-white/10 mx-1 mb-1.5" }),
    /* @__PURE__ */ jsx("div", { className: "px-1 mb-1.5", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          const next = !enabled;
          setEnabledLocal(next);
          setEnabled(next);
        },
        title: enabled ? "Clipping on" : "Clipping off",
        className: cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border",
          enabled ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        ),
        children: [
          enabled ? /* @__PURE__ */ jsx(Scissors, { size: 12 }) : /* @__PURE__ */ jsx(ScissorsLineDashed, { size: 12 }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: enabled ? "Clipping on" : "Clipping off" }),
          /* @__PURE__ */ jsx(Power, { size: 12, className: enabled ? "text-[hsl(var(--brand))]" : "text-muted-foreground" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "px-1 mb-1.5", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          const next = !outlines;
          setOutlinesLocal(next);
          setOutlinesVisible(next);
        },
        title: outlines ? "Outlines visible" : "Outlines hidden",
        className: cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors border",
          outlines ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        ),
        children: [
          outlines ? /* @__PURE__ */ jsx(Eye, { size: 12 }) : /* @__PURE__ */ jsx(EyeOff, { size: 12 }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: outlines ? "Outlines on" : "Outlines off" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "px-1 mb-1.5", children: /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setModeAll(isInside ? "outside" : "inside"),
        className: cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors",
          "border",
          isInside ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60"
        ),
        children: [
          /* @__PURE__ */ jsx(Scissors, { size: 12 }),
          /* @__PURE__ */ jsx("span", { children: isInside ? t.keepInside : t.keepOutside })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "max-h-40 overflow-y-auto flex flex-col gap-0.5 px-1", children: boxes.map((box) => {
      const isSelected = box.id === selectedClipBoxId;
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: cn(
            "flex items-center gap-1 rounded px-1 py-0.5 transition-colors",
            isSelected ? "bg-[hsl(var(--brand)/0.15)]" : "hover:bg-muted/40"
          ),
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                title: box.visible ? t.hide : t.show,
                onClick: () => setBoxVisible(box.id, !box.visible),
                className: "flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors",
                children: box.visible ? /* @__PURE__ */ jsx(Eye, { size: 12 }) : /* @__PURE__ */ jsx(EyeOff, { size: 12 })
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                title: box.name,
                onClick: () => selectBox(isSelected ? null : box.id),
                className: cn(
                  "flex-1 text-left text-xs truncate rounded transition-colors",
                  isSelected ? "text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground"
                ),
                children: box.name
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                title: t.delete,
                onClick: () => removeBox(box.id),
                className: "flex-shrink-0 p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors",
                children: /* @__PURE__ */ jsx(Trash2, { size: 12 })
              }
            )
          ]
        },
        box.id
      );
    }) }),
    selectedClipBoxId && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "h-px bg-white/10 mx-1 mt-1.5 mb-1.5" }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1 px-1", children: TRANSFORM_MODES.map(({ m, icon, label }) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setMode(m);
            setTransformMode(m);
          },
          title: label,
          className: cn(
            "flex-1 flex items-center justify-center gap-1 px-1.5 py-1 rounded text-xs transition-colors border",
            mode2 === m ? "bg-[hsl(var(--brand)/0.15)] border-[hsl(var(--brand)/0.4)] text-[hsl(var(--brand))]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60"
          ),
          children: [
            icon,
            /* @__PURE__ */ jsx("span", { className: "text-[10px]", children: label })
          ]
        },
        m
      )) }),
      /* @__PURE__ */ jsx("div", { className: "px-1 mt-1", children: /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => resetRotation(),
          title: "Reset the box back to axis-aligned",
          className: "w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded text-[10px] border border-white/10 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors",
          children: [
            /* @__PURE__ */ jsx(RotateCcw, { size: 12 }),
            /* @__PURE__ */ jsx("span", { children: "Reset rotation" })
          ]
        }
      ) })
    ] })
  ] });
}

// src/components/sidebar/sidebar.tsx
init_locale_context();
init_viewer_provider();

// src/components/sidebar/layers-panel.tsx
init_utils();
init_viewer_provider();
function LayerRow({
  icon,
  label,
  active,
  onToggle,
  disabled,
  hint
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick: disabled ? void 0 : onToggle,
      disabled,
      title: hint ?? label,
      className: cn(
        "flex items-center gap-2.5 w-full px-2 py-2 rounded-lg transition-colors text-left",
        disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10"
      ),
      children: [
        /* @__PURE__ */ jsx("span", { className: cn("text-white/50", active && !disabled && "text-[hsl(var(--brand))]"), children: icon }),
        /* @__PURE__ */ jsxs("span", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "block text-xs text-white/80 truncate", children: label }),
          hint && /* @__PURE__ */ jsx("span", { className: "block text-[10px] text-white/35 truncate", children: hint })
        ] }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "w-7 h-4 rounded-full transition-colors flex items-center px-0.5 shrink-0",
              active && !disabled ? "bg-[hsl(var(--brand)/0.6)]" : "bg-white/15"
            ),
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: cn(
                  "w-3 h-3 rounded-full bg-white transition-transform",
                  active && !disabled && "translate-x-3"
                )
              }
            )
          }
        )
      ]
    }
  );
}
function LayersPanel() {
  const {
    showMarkers,
    setShowMarkers,
    showMeasurements,
    setShowMeasurements,
    showMinimap,
    setShowMinimap,
    showBasemap,
    setShowBasemap,
    basemapAvailable
  } = useViewer();
  return /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-1 overflow-y-auto h-full", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1 mb-1", children: "Layers" }),
    /* @__PURE__ */ jsx(
      LayerRow,
      {
        icon: /* @__PURE__ */ jsx(Camera, { size: 15 }),
        label: "Panoramas",
        active: showMarkers,
        onToggle: () => setShowMarkers(!showMarkers)
      }
    ),
    /* @__PURE__ */ jsx(
      LayerRow,
      {
        icon: /* @__PURE__ */ jsx(Ruler, { size: 15 }),
        label: "Measurements",
        active: showMeasurements,
        onToggle: () => setShowMeasurements(!showMeasurements)
      }
    ),
    /* @__PURE__ */ jsx(
      LayerRow,
      {
        icon: /* @__PURE__ */ jsx(Map$1, { size: 15 }),
        label: "Minimap",
        active: showMinimap,
        onToggle: () => setShowMinimap(!showMinimap)
      }
    ),
    /* @__PURE__ */ jsx(
      LayerRow,
      {
        icon: /* @__PURE__ */ jsx(Globe, { size: 15 }),
        label: "Map basemap",
        active: showBasemap,
        onToggle: () => setShowBasemap(!showBasemap),
        disabled: !basemapAvailable,
        hint: basemapAvailable ? void 0 : "Requires a georeferenced cloud or basemap config"
      }
    )
  ] });
}

// src/components/sidebar/pano-panel.tsx
init_utils();
init_viewer_provider();
init_data_provider();
init_locale_context();
function PanoPanel() {
  const { cameraAnimator, markerManager, setSelectedCamera, showMarkers, setShowMarkers } = useViewer();
  const { cameras } = useData();
  const t = useLocale().panoPanel;
  const tToolbar = useLocale().toolbar;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return cameras.filter((c) => !q || c.name.toLowerCase().includes(q) || String(c.index).includes(q));
  }, [cameras, query]);
  const flyTo = (idx) => {
    const cam = cameras[idx];
    if (!cam || !cameraAnimator) return;
    setSelected(idx);
    markerManager?.setSelected(idx);
    if (cam.position) {
      cameraAnimator.flyToCamera([cam.position.x, cam.position.y, cam.position.z], cam.yaw_deg ?? 0);
    }
  };
  const openPano = (idx) => {
    const cam = cameras[idx];
    if (!cam) return;
    setSelected(idx);
    setSelectedCamera(cam);
    markerManager?.setSelected(idx);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))] shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 bg-muted rounded px-2 py-1", children: [
        /* @__PURE__ */ jsx(Search, { size: 11, className: "text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: query,
            onChange: (e) => setQuery(e.target.value),
            placeholder: t.searchPlaceholder,
            className: "flex-1 bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-1.5", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground font-mono", children: [
          filtered.length,
          " / ",
          cameras.length
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setShowMarkers(!showMarkers),
            title: tToolbar.togglePanoramas,
            className: cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors",
              showMarkers ? "text-[hsl(var(--brand))] bg-[hsl(var(--brand)/0.12)] hover:bg-[hsl(var(--brand)/0.2)]" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            ),
            children: [
              showMarkers ? /* @__PURE__ */ jsx(Eye, { size: 11 }) : /* @__PURE__ */ jsx(EyeOff, { size: 11 }),
              /* @__PURE__ */ jsx("span", { children: tToolbar.panoramas })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: filtered.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center mt-8 px-4", children: t.noResults }) : filtered.map((cam) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex items-center gap-2 px-2 py-1.5 cursor-pointer border-b border-[hsl(var(--border)/0.4)] hover:bg-muted transition-colors
                ${selected === cam.index ? "bg-[hsl(var(--brand)/0.12)] border-l-2 border-l-[hsl(var(--brand))]" : ""}`,
        onClick: () => openPano(cam.index),
        children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-7 rounded shrink-0 bg-muted overflow-hidden", children: cam.thumbnail || cam.image ? /* @__PURE__ */ jsx(
            "img",
            {
              src: cam.thumbnail ?? cam.image ?? void 0,
              alt: cam.name,
              className: "w-full h-full object-cover",
              loading: "lazy",
              onError: (e) => {
                e.target.style.display = "none";
              }
            }
          ) : /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsx(Navigation, { size: 10, className: "text-muted-foreground" }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-mono truncate text-foreground", children: cam.name }),
            cam.position && /* @__PURE__ */ jsxs("p", { className: "text-[9px] text-muted-foreground font-mono", children: [
              cam.position.x.toFixed(1),
              ", ",
              cam.position.y.toFixed(1),
              ", ",
              cam.position.z.toFixed(1)
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                flyTo(cam.index);
              },
              title: t.flyTo,
              className: "shrink-0 text-muted-foreground hover:text-[hsl(var(--brand))] transition-colors",
              children: /* @__PURE__ */ jsx(Navigation, { size: 11 })
            }
          )
        ]
      },
      cam.index
    )) })
  ] });
}

// src/components/sidebar/scene-panel.tsx
init_viewer_provider();
init_locale_context();
function ScenePanel() {
  const { measurementList, measurementManager, setMeasurementList, loader, clipManager, clipBoxEntries, selectedClipBoxId } = useViewer();
  const t = useLocale().scenePanel;
  const deleteMeasurement = (id) => {
    measurementManager?.remove(id);
    setMeasurementList((prev) => prev.filter((m) => m.id !== id));
  };
  const clearAll = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full overflow-y-auto text-xs", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: t.pointClouds }),
      loader?.getPointCloud() ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 py-1", children: [
        /* @__PURE__ */ jsx(CloudCog, { size: 12, className: "text-[hsl(var(--brand))] shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "flex-1 truncate font-mono text-foreground", children: "pointcloud" })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-[10px]", children: t.noCloudLoaded })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.measurements }),
        measurementList.length > 0 && /* @__PURE__ */ jsx("button", { onClick: clearAll, title: t.clearAll, className: "text-muted-foreground hover:text-destructive transition-colors", children: /* @__PURE__ */ jsx(Trash2, { size: 11 }) })
      ] }),
      measurementList.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: t.none }) : measurementList.map((m) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 py-0.5 group", children: [
        /* @__PURE__ */ jsx(Ruler, { size: 11, className: "text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "flex-1 truncate font-mono text-foreground capitalize", children: m.type }),
        m.value !== void 0 && /* @__PURE__ */ jsx("span", { className: "font-mono text-[10px] text-[hsl(var(--brand))]", children: m.value.toFixed(2) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => deleteMeasurement(m.id),
            className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all",
            children: /* @__PURE__ */ jsx(Trash2, { size: 10 })
          }
        )
      ] }, m.id))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.sections }),
        clipBoxEntries.length > 0 && /* @__PURE__ */ jsx("button", { onClick: () => clipManager?.clear(), title: t.clearAll, className: "text-muted-foreground hover:text-destructive transition-colors", children: /* @__PURE__ */ jsx(Trash2, { size: 11 }) })
      ] }),
      clipBoxEntries.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: t.sectionHint }) : clipBoxEntries.map((box) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex items-center gap-1 py-0.5 group rounded px-0.5 ${selectedClipBoxId === box.id ? "bg-[hsl(var(--brand)/0.1)]" : ""}`,
          children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => clipManager?.setBoxVisible(box.id, !box.visible),
                className: "text-muted-foreground hover:text-foreground transition-colors shrink-0",
                title: box.visible ? "Hide" : "Show",
                children: box.visible ? /* @__PURE__ */ jsx(Eye, { size: 11 }) : /* @__PURE__ */ jsx(EyeOff, { size: 11 })
              }
            ),
            /* @__PURE__ */ jsx(BoxSelect, { size: 11, className: "text-[hsl(var(--brand))] shrink-0" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => clipManager?.selectBox(selectedClipBoxId === box.id ? null : box.id),
                className: "flex-1 truncate font-mono text-foreground text-left hover:text-[hsl(var(--brand))] transition-colors",
                children: box.name
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => clipManager?.setModeAll(box.mode === "outside" ? "inside" : "outside"),
                title: box.mode === "outside" ? "Keep inside (all)" : "Keep outside (all)",
                className: "text-muted-foreground hover:text-foreground transition-colors shrink-0",
                children: /* @__PURE__ */ jsx(Scissors, { size: 10 })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-[8px] text-muted-foreground font-mono w-6 text-center", children: box.mode === "outside" ? "OUT" : "IN" }),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => clipManager?.removeBox(box.id),
                className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0",
                children: /* @__PURE__ */ jsx(Trash2, { size: 10 })
              }
            )
          ]
        },
        box.id
      )),
      clipBoxEntries.length > 1 && /* @__PURE__ */ jsx("p", { className: "text-[9px] text-muted-foreground mt-1 italic", children: t.clipModeNote })
    ] })
  ] });
}

// src/components/sidebar/measurements-panel.tsx
init_viewer_provider();
init_locale_context();
init_utils();
function formatValue(m) {
  if (m.value === void 0) return "\u2014";
  switch (m.type) {
    case "distance":
    case "height":
      return formatLength(m.value);
    case "area":
      return formatArea(m.value);
    case "volume":
      return formatVolume(m.value);
    case "angle":
      return formatAngle(m.value);
    case "point":
      if (m.points[0]) return formatCoord(m.points[0].x, m.points[0].y, m.points[0].z);
      return "\u2014";
    default:
      return m.value.toFixed(3);
  }
}
function InlineEditName({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);
  if (!editing) {
    return /* @__PURE__ */ jsx(
      "p",
      {
        className: "text-[10px] font-semibold text-foreground cursor-pointer hover:text-[hsl(var(--brand))] transition-colors truncate",
        onClick: () => {
          setDraft(value);
          setEditing(true);
        },
        title: "Click to rename",
        children: value
      }
    );
  }
  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };
  return /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      type: "text",
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      },
      onBlur: save,
      className: "text-[10px] font-semibold text-foreground bg-muted/60 border border-[hsl(var(--border))] rounded px-1 py-0 w-full outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
    }
  );
}
function MeasurementsPanel() {
  const { measurementList, measurementManager, setMeasurementList } = useViewer();
  const t = useLocale().measurementsPanel;
  ({
    point: t.typePoint,
    distance: t.typeDistance,
    height: t.typeHeight,
    area: t.typeArea,
    volume: t.typeVolume,
    angle: t.typeAngle,
    profile: t.typeProfile
  });
  const del = (id) => {
    measurementManager?.remove(id);
    setMeasurementList((prev) => prev.filter((m) => m.id !== id));
  };
  const clearAll = () => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  };
  const downloadCSV = () => {
    const csv = exportMeasurementsCSV(measurementList);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `measurements_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleRename = (id, name) => {
    measurementManager?.rename(id, name);
    setMeasurementList((prev) => prev.map((m) => m.id === id ? { ...m, label: name } : m));
  };
  if (measurementList.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center px-4 gap-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: t.noMeasurements }),
      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: t.useMeasureToolHint })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-2 py-1.5 border-b border-[hsl(var(--border))] shrink-0", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-muted-foreground", children: t.measurementCount(measurementList.length) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("button", { onClick: downloadCSV, title: t.downloadCsv, className: "text-muted-foreground hover:text-[hsl(var(--brand))] text-[10px] flex items-center gap-1 transition-colors", children: [
          /* @__PURE__ */ jsx(Download, { size: 10 }),
          " ",
          t.csv
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: clearAll, title: t.clearAll, className: "text-muted-foreground hover:text-destructive text-[10px] flex items-center gap-1 transition-colors", children: [
          /* @__PURE__ */ jsx(Trash2, { size: 10 }),
          " ",
          t.clearAll
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto", children: measurementList.map((m) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-2 py-2 border-b border-[hsl(var(--border)/0.4)] hover:bg-muted group transition-colors", children: [
      /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: m.color ?? "hsl(var(--brand))" } }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(InlineEditName, { value: m.label, onSave: (name) => handleRename(m.id, name) }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono text-[hsl(var(--brand))]", children: formatValue(m) })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => del(m.id),
          className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all",
          children: /* @__PURE__ */ jsx(Trash2, { size: 11 })
        }
      )
    ] }, m.id)) })
  ] });
}

// src/components/sidebar/classification-panel.tsx
init_viewer_provider();
init_locale_context();
var CLASS_DEFS = [
  { code: 0, color: "#aaaaaa" },
  { code: 1, color: "#888888" },
  { code: 2, color: "#c8a46e" },
  { code: 3, color: "#5ec45e" },
  { code: 4, color: "#2ea02e" },
  { code: 5, color: "#006600" },
  { code: 6, color: "#e07070" },
  { code: 7, color: "#ff4444" },
  { code: 9, color: "#4488ff" },
  { code: 17, color: "#cc88ff" },
  { code: 18, color: "#ff8800" }
];
function ClassificationPanel() {
  const { loader } = useViewer();
  const t = useLocale().classificationPanel;
  const [visible, setVisible] = useState(
    Object.fromEntries(CLASS_DEFS.map((c) => [c.code, true]))
  );
  const toggle = (code) => {
    setVisible((prev) => {
      const next = { ...prev, [code]: !prev[code] };
      const cloud = loader?.getPointCloud();
      if (cloud?.material) {
        const mat = cloud.material;
        if (mat.classification) {
          const THREE3 = window.THREE;
          const hexColor = CLASS_DEFS.find((c) => c.code === code)?.color ?? "#ffffff";
          mat.classification[code] = { visible: next[code], color: THREE3 ? new THREE3.Color(hexColor) : hexColor };
        }
      }
      return next;
    });
  };
  const toggleAll = (on) => {
    const next = Object.fromEntries(CLASS_DEFS.map((c) => [c.code, on]));
    setVisible(next);
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full overflow-y-auto p-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx("button", { onClick: () => toggleAll(true), className: "text-[9px] text-muted-foreground hover:text-foreground transition-colors", children: t.all }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-[9px]", children: "/" }),
        /* @__PURE__ */ jsx("button", { onClick: () => toggleAll(false), className: "text-[9px] text-muted-foreground hover:text-foreground transition-colors", children: t.none })
      ] })
    ] }),
    CLASS_DEFS.map((cls) => /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 py-1 cursor-pointer group", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          checked: visible[cls.code] ?? true,
          onChange: () => toggle(cls.code),
          className: "accent-[hsl(var(--brand))] w-3 h-3 shrink-0"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "w-2.5 h-2.5 rounded-sm shrink-0", style: { background: cls.color } }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-mono text-foreground", children: cls.code }),
      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground truncate", children: t.classLabels[cls.code] ?? String(cls.code) })
    ] }, cls.code))
  ] });
}

// src/components/sidebar/scenes-panel.tsx
init_viewer_provider();
init_locale_context();
init_dist();
function InlineEditSceneName({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);
  if (!editing) {
    return /* @__PURE__ */ jsx(
      "p",
      {
        className: "font-mono text-foreground truncate text-[11px] cursor-pointer hover:text-[hsl(var(--brand))] transition-colors",
        onDoubleClick: () => {
          setDraft(value);
          setEditing(true);
        },
        title: "Double-click to rename",
        children: value
      }
    );
  }
  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    setEditing(false);
  };
  return /* @__PURE__ */ jsx(
    "input",
    {
      ref: inputRef,
      type: "text",
      value: draft,
      onChange: (e) => setDraft(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      },
      onBlur: save,
      className: "font-mono text-foreground text-[11px] bg-muted/60 border border-[hsl(var(--border))] rounded px-1 py-0 w-full outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
    }
  );
}
function ScenesPanel() {
  const {
    sceneManager,
    cameraAnimator,
    clipManager,
    loader,
    clipBoxEntries,
    colorMode,
    pointSize,
    pointBudget,
    setColorMode,
    setPointSize,
    setPointBudget,
    config
  } = useViewer();
  const t = useLocale().scenesPanel;
  const [scenes, setScenes] = useState([]);
  const [newName, setNewName] = useState("");
  const pmRef = useRef(null);
  const fileInputRef = useRef(null);
  useEffect(() => {
    const key = config.source.type === "s3" ? config.source.baseUrl : config.source.type === "electron" ? config.source.basePath : "local";
    const pm = new PresentationManager(key);
    pm.onChange = (s) => setScenes(s);
    pmRef.current = pm;
    setScenes(pm.getScenes());
  }, [config.source]);
  const handleSave = () => {
    if (!sceneManager || !pmRef.current) return;
    const name = newName.trim() || `Scene ${scenes.length + 1}`;
    const scene = captureScene(
      name,
      sceneManager.camera.position,
      sceneManager.controls.target,
      clipBoxEntries,
      colorMode,
      pointSize,
      pointBudget
    );
    pmRef.current.addScene(scene);
    setNewName("");
  };
  const handleRestore = async (scene) => {
    if (!sceneManager) return;
    const pos = new THREE5.Vector3(...scene.camera.position);
    const target = new THREE5.Vector3(...scene.camera.target);
    if (cameraAnimator) {
      await cameraAnimator.flyTo({ position: pos, target, duration: 600 });
    } else {
      sceneManager.camera.position.copy(pos);
      sceneManager.controls.target.copy(target);
      sceneManager.controls.update();
    }
    if (clipManager) {
      clipManager.clear();
      for (const cb of scene.clipBoxes) {
        const box = new THREE5.Box3(
          new THREE5.Vector3(...cb.min),
          new THREE5.Vector3(...cb.max)
        );
        const entry = clipManager.addBox(box, cb.name);
        if (cb.mode !== entry.mode) clipManager.setBoxMode(entry.id, cb.mode);
        if (!cb.visible) clipManager.setBoxVisible(entry.id, false);
      }
    }
    if (scene.colorMode && loader) {
      const cm = scene.colorMode;
      await loader.setColorMode(cm);
      setColorMode(cm);
    }
    if (scene.pointSize) {
      loader?.setPointSize(scene.pointSize);
      setPointSize(scene.pointSize);
    }
    if (scene.pointBudget) {
      loader?.setPointBudget(scene.pointBudget);
      setPointBudget(scene.pointBudget);
    }
  };
  const handleExport = () => {
    if (!pmRef.current) return;
    const json = pmRef.current.exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scenes_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file || !pmRef.current) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      pmRef.current?.importJSON(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full overflow-y-auto text-xs", children: [
    /* @__PURE__ */ jsxs("div", { className: "p-2 border-b border-[hsl(var(--border))]", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: t.saveScene }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: newName,
            onChange: (e) => setNewName(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && handleSave(),
            placeholder: t.namePlaceholder,
            className: "flex-1 bg-muted/40 border border-[hsl(var(--border))] rounded px-1.5 py-0.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--brand))]"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleSave,
            title: t.save,
            className: "px-2 py-0.5 rounded bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.3)] transition-colors",
            children: /* @__PURE__ */ jsx(Plus, { size: 13 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-2 flex-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: t.savedScenes }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsx("button", { onClick: handleExport, title: t.exportJson, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(Download, { size: 11 }) }),
          /* @__PURE__ */ jsx("button", { onClick: () => fileInputRef.current?.click(), title: t.importJson, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(Upload, { size: 11 }) }),
          /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: ".json", onChange: handleImport, className: "hidden" })
        ] })
      ] }),
      scenes.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground", children: t.noScenes }) : scenes.map((scene) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 py-1 group border-b border-[hsl(var(--border)/0.3)] last:border-0", children: [
        /* @__PURE__ */ jsx(Bookmark, { size: 11, className: "text-[hsl(var(--brand))] shrink-0" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx(InlineEditSceneName, { value: scene.name, onSave: (name) => pmRef.current?.renameScene(scene.id, name) }),
          /* @__PURE__ */ jsxs("p", { className: "text-[8px] text-muted-foreground font-mono", children: [
            new Date(scene.createdAt).toLocaleDateString(),
            scene.clipBoxes.length > 0 && ` \xB7 ${scene.clipBoxes.length} clip`
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => handleRestore(scene),
            title: t.restore,
            className: "text-[hsl(var(--brand))] hover:text-foreground transition-colors shrink-0",
            children: /* @__PURE__ */ jsx(Play, { size: 12 })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => pmRef.current?.removeScene(scene.id),
            className: "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all shrink-0",
            children: /* @__PURE__ */ jsx(Trash2, { size: 10 })
          }
        )
      ] }, scene.id))
    ] })
  ] });
}
function Sidebar() {
  const [tab, setTab] = useState("layers");
  const t = useLocale().sidebar;
  const { uiMode } = useViewer();
  const isPro = uiMode === "professional";
  const ALL_TABS = [
    { id: "layers", icon: /* @__PURE__ */ jsx(Layers, { size: 14 }), label: t.tabLayers },
    { id: "panoramas", icon: /* @__PURE__ */ jsx(Camera, { size: 14 }), label: t.tabPanoramas },
    { id: "scene", icon: /* @__PURE__ */ jsx(Box, { size: 14 }), label: t.tabScene },
    { id: "measurements", icon: /* @__PURE__ */ jsx(Ruler, { size: 14 }), label: t.tabMeasurements },
    { id: "classification", icon: /* @__PURE__ */ jsx(Tag, { size: 14 }), label: t.tabClassification, proOnly: true },
    { id: "scenes", icon: /* @__PURE__ */ jsx(Bookmark, { size: 14 }), label: t.tabScenes, proOnly: true }
  ];
  const TABS = ALL_TABS.filter((entry) => isPro || !entry.proOnly);
  const activeTab = TABS.some((tb) => tb.id === tab) ? tab : "panoramas";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsx("div", { className: "flex border-b border-white/10 shrink-0", children: TABS.map((tb) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setTab(tb.id),
        title: tb.label,
        className: `flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-mono transition-colors
              ${activeTab === tb.id ? "text-[hsl(var(--brand))] border-b-2 border-[hsl(var(--brand))] -mb-px" : "text-white/50 hover:text-white/80"}`,
        children: [
          tb.icon,
          /* @__PURE__ */ jsx("span", { className: "hidden xl:block", children: tb.label })
        ]
      },
      tb.id
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-hidden", children: [
      activeTab === "layers" && /* @__PURE__ */ jsx(LayersPanel, {}),
      activeTab === "panoramas" && /* @__PURE__ */ jsx(PanoPanel, {}),
      activeTab === "scene" && /* @__PURE__ */ jsx(ScenePanel, {}),
      activeTab === "measurements" && /* @__PURE__ */ jsx(MeasurementsPanel, {}),
      activeTab === "classification" && /* @__PURE__ */ jsx(ClassificationPanel, {}),
      activeTab === "scenes" && /* @__PURE__ */ jsx(ScenesPanel, {})
    ] })
  ] });
}

// src/components/overlays/pano-viewer.tsx
init_viewer_provider();
init_locale_context();

// src/components/overlays/pano-engines/pannellum.ts
var PANNELLUM_VERSION = "2.5.6";
var CDN = `https://cdn.jsdelivr.net/npm/pannellum@${PANNELLUM_VERSION}/build`;
var pannellumPromise = null;
function loadPannellum() {
  const w = window;
  if (w.pannellum) return Promise.resolve(w.pannellum);
  if (pannellumPromise) return pannellumPromise;
  pannellumPromise = new Promise((resolve, reject) => {
    if (!document.getElementById("pannellum-css")) {
      const link = document.createElement("link");
      link.id = "pannellum-css";
      link.rel = "stylesheet";
      link.href = `${CDN}/pannellum.css`;
      document.head.appendChild(link);
    }
    const onLoad = () => resolve(window.pannellum);
    const onError = () => {
      pannellumPromise = null;
      reject(new Error("Failed to load Pannellum from CDN"));
    };
    const existing = document.getElementById("pannellum-js");
    if (existing) {
      if (window.pannellum) {
        onLoad();
        return;
      }
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return;
    }
    const script = document.createElement("script");
    script.id = "pannellum-js";
    script.src = `${CDN}/pannellum.js`;
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);
  });
  return pannellumPromise;
}
var initPannellum = async (container, camera) => {
  if (!camera.image) return { destroy() {
  } };
  const pannellum = await loadPannellum();
  const viewer = pannellum.viewer(container, {
    type: "equirectangular",
    panorama: camera.image,
    autoLoad: true,
    showZoomCtrl: false,
    showFullscreenCtrl: false,
    compass: false,
    yaw: camera.yaw_deg ?? 0,
    hfov: 100,
    minHfov: 30,
    maxHfov: 150
  });
  return {
    destroy() {
      try {
        viewer.destroy();
      } catch {
      }
    }
  };
};

// src/components/overlays/pano-engines/photo-sphere.ts
var PSV_VERSION = "5";
var PSV_ESM_URL = `https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@${PSV_VERSION}/+esm`;
var PSV_CSS_URL = `https://cdn.jsdelivr.net/npm/@photo-sphere-viewer/core@${PSV_VERSION}/index.css`;
var runtimeImport = new Function("u", "return import(u)");
var psvModulePromise = null;
function loadPsv() {
  if (!psvModulePromise) psvModulePromise = runtimeImport(PSV_ESM_URL);
  return psvModulePromise;
}
var initPhotoSphere = async (container, camera) => {
  if (!camera.image) return { destroy() {
  } };
  if (!document.getElementById("psv-core-css")) {
    const link = document.createElement("link");
    link.id = "psv-core-css";
    link.rel = "stylesheet";
    link.href = PSV_CSS_URL;
    document.head.appendChild(link);
  }
  const mod = await loadPsv();
  const Viewer = mod.Viewer;
  if (!Viewer) throw new Error("Photo Sphere Viewer: `Viewer` export not found on CDN module");
  const viewer = new Viewer({
    container,
    panorama: camera.image,
    // PSV accepts an angle string; convert the camera's yaw (degrees) directly.
    defaultYaw: `${camera.yaw_deg ?? 0}deg`,
    // Built-in controls: zoom in/out, pan/move, and fullscreen. Mouse-wheel zoom
    // and drag-to-look are on by default; these add the on-screen buttons.
    navbar: ["zoom", "move", "fullscreen"],
    mousewheel: true,
    loadingTxt: ""
  });
  return {
    destroy() {
      try {
        viewer.destroy();
      } catch {
      }
    }
  };
};

// src/components/overlays/pano-engines/index.ts
var ENGINES = {
  pannellum: initPannellum,
  "photo-sphere-viewer": initPhotoSphere
};
function getPanoEngine(engine) {
  return ENGINES[engine] ?? initPhotoSphere;
}
function PanoViewer() {
  const { selectedCamera, setSelectedCamera, panoEngine, setPanoEngine } = useViewer();
  const tPano = useLocale().panoViewer;
  const containerRef = useRef(null);
  const instanceRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!selectedCamera?.image || !container) return;
    let cancelled = false;
    const init37 = getPanoEngine(panoEngine);
    instanceRef.current?.destroy();
    instanceRef.current = null;
    init37(container, selectedCamera).then((instance) => {
      if (cancelled) {
        instance.destroy();
        return;
      }
      instanceRef.current = instance;
    }).catch(console.error);
    return () => {
      cancelled = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [selectedCamera, panoEngine]);
  if (!selectedCamera) return null;
  return /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-40 bg-black flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-3 py-2 bg-black/80 backdrop-blur shrink-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Navigation, { size: 14, className: "text-[hsl(var(--brand))]" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-white", children: selectedCamera.name }),
        selectedCamera.position && /* @__PURE__ */ jsxs("span", { className: "text-xs text-white/50 font-mono hidden sm:block", children: [
          selectedCamera.position.x.toFixed(2),
          ", ",
          selectedCamera.position.y.toFixed(2),
          ", ",
          selectedCamera.position.z.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center rounded-md border border-white/15 overflow-hidden text-[11px] font-mono", children: ["pannellum", "photo-sphere-viewer"].map((eng) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setPanoEngine(eng),
            className: panoEngine === eng ? "px-2 py-0.5 bg-[hsl(var(--brand))] text-black" : "px-2 py-0.5 text-white/60 hover:text-white hover:bg-white/10",
            title: eng === "pannellum" ? "Pannellum" : "Photo Sphere Viewer",
            children: eng === "pannellum" ? "Pannellum" : "PSV"
          },
          eng
        )) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setSelectedCamera(null),
            className: "text-white/70 hover:text-white transition-colors p-1",
            title: tPano.close,
            children: /* @__PURE__ */ jsx(X, { size: 18 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { ref: containerRef, className: "flex-1" }, panoEngine)
  ] });
}

// src/components/overlays/rendering-settings.tsx
init_viewer_provider();
init_locale_context();
function useDraggable(options) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const boundsRef = useRef(options?.bounds);
  boundsRef.current = options?.bounds;
  const moveRef = useRef(null);
  const upRef = useRef(null);
  const endDrag = useCallback(() => {
    if (moveRef.current) window.removeEventListener("mousemove", moveRef.current);
    if (upRef.current) window.removeEventListener("mouseup", upRef.current);
    moveRef.current = null;
    upRef.current = null;
  }, []);
  useEffect(() => endDrag, [endDrag]);
  const reset = useCallback(() => {
    positionRef.current = { x: 0, y: 0 };
    setPosition({ x: 0, y: 0 });
  }, []);
  const onDragStart = useCallback(
    (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const baseX = positionRef.current.x;
      const baseY = positionRef.current.y;
      const rect = boundsRef.current?.current?.getBoundingClientRect() ?? null;
      const onMove = (ev) => {
        let dx = ev.clientX - startX;
        let dy = ev.clientY - startY;
        if (rect) {
          const cx = Math.min(rect.right, Math.max(rect.left, ev.clientX));
          const cy = Math.min(rect.bottom, Math.max(rect.top, ev.clientY));
          dx = cx - startX;
          dy = cy - startY;
        }
        const next = { x: baseX + dx, y: baseY + dy };
        positionRef.current = next;
        setPosition(next);
      };
      moveRef.current = onMove;
      upRef.current = endDrag;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", endDrag);
    },
    [endDrag]
  );
  return { position, onDragStart, reset };
}
function RenderingSettings({ open, onClose }) {
  const { loader } = useViewer();
  const t = useLocale().renderingSettings;
  const pcvRoot = usePcvRoot();
  const { position, onDragStart, reset } = useDraggable({ bounds: pcvRoot ?? void 0 });
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);
  const [rgbGamma, setRgbGamma] = useState(1);
  const [rgbBrightness, setRgbBrightness] = useState(0);
  const [rgbContrast, setRgbContrast] = useState(0);
  const [intensityGamma, setIntensityGamma] = useState(1);
  const [intensityBrightness, setIntensityBrightness] = useState(0);
  const [intensityContrast, setIntensityContrast] = useState(0);
  const [intensityRange, setIntensityRange] = useState([0, 65535]);
  const [heightMin, setHeightMin] = useState(0);
  const [heightMax, setHeightMax] = useState(100);
  const [opacity, setOpacity] = useState(1);
  useEffect(() => {
    if (!open || !loader) return;
    const pc = loader.getPointCloud();
    if (!pc) return;
    const mat = pc.material;
    if (!mat) return;
    setRgbGamma(mat.uniforms?.rgbGamma?.value ?? mat.rgbGamma ?? 1);
    setRgbBrightness(mat.uniforms?.rgbBrightness?.value ?? mat.rgbBrightness ?? 0);
    setRgbContrast(mat.uniforms?.rgbContrast?.value ?? mat.rgbContrast ?? 0);
    setIntensityGamma(mat.uniforms?.intensityGamma?.value ?? mat.intensityGamma ?? 1);
    setIntensityBrightness(mat.uniforms?.intensityBrightness?.value ?? mat.intensityBrightness ?? 0);
    setIntensityContrast(mat.uniforms?.intensityContrast?.value ?? mat.intensityContrast ?? 0);
    setOpacity(mat.opacity ?? 1);
    const wb2 = loader.worldBox;
    if (wb2 && !wb2.isEmpty()) {
      setHeightMin(mat.uniforms?.heightMin?.value ?? mat.heightMin ?? wb2.min.z);
      setHeightMax(mat.uniforms?.heightMax?.value ?? mat.heightMax ?? wb2.max.z);
    }
    const ir = mat.uniforms?.intensityRange?.value ?? mat.intensityRange;
    if (ir) setIntensityRange([ir[0] ?? 0, ir[1] ?? 65535]);
  }, [open, loader]);
  const apply = (setter, prop, value) => {
    setter(value);
    if (!loader) return;
    const pc = loader.getPointCloud();
    if (!pc) return;
    const mat = pc.material;
    if (!mat) return;
    mat[prop] = value;
    mat.needsUpdate = true;
  };
  const applyIntensityRange = (min, max) => {
    setIntensityRange([min, max]);
    if (!loader) return;
    const pc = loader.getPointCloud();
    if (!pc) return;
    const mat = pc.material;
    if (!mat) return;
    mat.intensityRange = [min, max];
    mat.needsUpdate = true;
  };
  if (!open) return null;
  const wb = loader?.worldBox;
  const zMin = wb && !wb.isEmpty() ? wb.min.z : -100;
  const zMax = wb && !wb.isEmpty() ? wb.max.z : 100;
  const zRange = zMax - zMin;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "absolute top-12 left-12 z-50 w-80 max-h-[calc(100vh-6rem)] overflow-y-auto bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-lg shadow-xl",
      style: { transform: `translate(${position.x}px, ${position.y}px)` },
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between px-3 py-2 border-b border-[hsl(var(--border))] cursor-move select-none",
            onMouseDown: onDragStart,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(Sliders, { size: 14, className: "text-[hsl(var(--brand))]" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", children: t.title })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onClose,
                  onMouseDown: (e) => e.stopPropagation(),
                  className: "text-muted-foreground hover:text-foreground transition-colors p-0.5",
                  children: /* @__PURE__ */ jsx(X, { size: 14 })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "p-3 space-y-4 text-xs", children: [
          /* @__PURE__ */ jsxs(Section, { title: t.rgbSection, children: [
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.gamma,
                value: rgbGamma,
                min: 0.1,
                max: 4,
                step: 0.05,
                onChange: (v) => apply(setRgbGamma, "rgbGamma", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.brightness,
                value: rgbBrightness,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => apply(setRgbBrightness, "rgbBrightness", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.contrast,
                value: rgbContrast,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => apply(setRgbContrast, "rgbContrast", v)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Section, { title: t.intensitySection, children: [
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.gamma,
                value: intensityGamma,
                min: 0.1,
                max: 4,
                step: 0.05,
                onChange: (v) => apply(setIntensityGamma, "intensityGamma", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.brightness,
                value: intensityBrightness,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => apply(setIntensityBrightness, "intensityBrightness", v)
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.contrast,
                value: intensityContrast,
                min: -1,
                max: 1,
                step: 0.02,
                onChange: (v) => apply(setIntensityContrast, "intensityContrast", v)
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-16 text-muted-foreground", children: t.range }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: intensityRange[0],
                  min: 0,
                  max: 65535,
                  onChange: (e) => applyIntensityRange(Number(e.target.value), intensityRange[1]),
                  className: "w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "\u2013" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "number",
                  value: intensityRange[1],
                  min: 0,
                  max: 65535,
                  onChange: (e) => applyIntensityRange(intensityRange[0], Number(e.target.value)),
                  className: "w-16 bg-muted/40 border border-[hsl(var(--border))] rounded px-1 py-0.5 text-[10px] font-mono"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Section, { title: t.elevationSection, children: [
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.elevMin,
                value: heightMin,
                min: zMin - zRange * 0.1,
                max: zMax + zRange * 0.1,
                step: zRange / 200,
                onChange: (v) => apply(setHeightMin, "heightMin", v),
                display: (v) => v.toFixed(1) + "m"
              }
            ),
            /* @__PURE__ */ jsx(
              Slider,
              {
                label: t.elevMax,
                value: heightMax,
                min: zMin - zRange * 0.1,
                max: zMax + zRange * 0.1,
                step: zRange / 200,
                onChange: (v) => apply(setHeightMax, "heightMax", v),
                display: (v) => v.toFixed(1) + "m"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Section, { title: t.generalSection, children: /* @__PURE__ */ jsx(
            Slider,
            {
              label: t.opacity,
              value: opacity,
              min: 0,
              max: 1,
              step: 0.02,
              onChange: (v) => apply(setOpacity, "opacity", v)
            }
          ) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                apply(setRgbGamma, "rgbGamma", 1);
                apply(setRgbBrightness, "rgbBrightness", 0);
                apply(setRgbContrast, "rgbContrast", 0);
                apply(setIntensityGamma, "intensityGamma", 1);
                apply(setIntensityBrightness, "intensityBrightness", 0);
                apply(setIntensityContrast, "intensityContrast", 0);
                apply(setOpacity, "opacity", 1);
                if (wb && !wb.isEmpty()) {
                  apply(setHeightMin, "heightMin", wb.min.z);
                  apply(setHeightMax, "heightMax", wb.max.z);
                }
                applyIntensityRange(0, 65535);
              },
              className: "w-full py-1.5 text-center rounded bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors text-[10px] font-mono",
              children: t.reset
            }
          )
        ] })
      ]
    }
  );
}
function Section({ title, children }) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5", children: title }),
    /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children })
  ] });
}
function Slider({ label, value, min, max, step, onChange, display }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "w-16 text-muted-foreground shrink-0", children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "range",
        min,
        max,
        step,
        value,
        onChange: (e) => onChange(Number(e.target.value)),
        className: "flex-1 accent-[hsl(var(--brand))] h-1"
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "w-12 text-right font-mono text-[10px] tabular-nums", children: display ? display(value) : value.toFixed(2) })
  ] });
}

// src/components/overlays/quick-settings-popover.tsx
init_utils();
init_viewer_provider();

// src/version.ts
var PCV_VERSION = "0.2.0" ;
var PCV_BUILD = "474b95b \xB7 2026-06-29 15:44Z" ;
var PCV_VERSION_STRING = `v${PCV_VERSION} \xB7 ${PCV_BUILD}`;
var COLOR_MODES2 = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "classification", label: "Classification" }
];
function QuickSettingsPopover({ onClose: _onClose }) {
  const {
    colorMode,
    setColorMode,
    pointSize,
    setPointSize,
    loader
  } = useViewer();
  return /* @__PURE__ */ jsx("div", { className: "absolute top-16 right-3 z-40", children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "w-56 p-3 space-y-3",
        "backdrop-blur-xl bg-black/30 dark:bg-black/40",
        "border border-white/15 dark:border-white/10",
        "rounded-xl shadow-2xl shadow-black/20"
      ),
      children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Display Settings" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Color" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1", children: COLOR_MODES2.map((cm) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setColorMode(cm.value);
                loader?.setColorMode(cm.value);
              },
              className: cn(
                "text-[10px] py-1 px-2 rounded-lg transition-colors",
                colorMode === cm.value ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))]" : "text-white/60 hover:text-white hover:bg-white/10"
              ),
              children: cm.label
            },
            cm.value
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Point Size" }),
          /* @__PURE__ */ jsx("div", { className: "px-1", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: 0.5,
              max: 5,
              step: 0.1,
              value: pointSize,
              onChange: (e) => {
                const v = parseFloat(e.target.value);
                setPointSize(v);
                loader?.setPointSize(v);
              },
              className: "pcv-slider w-full"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-white/10 pt-2 px-1", children: /* @__PURE__ */ jsxs("p", { className: "text-[9px] font-mono text-white/35 leading-tight", title: "Viewer version \xB7 build", children: [
          "v",
          PCV_VERSION,
          " \xB7 ",
          PCV_BUILD
        ] }) })
      ]
    }
  ) });
}
var chromeScale = { zoom: "var(--pcv-scale, 1)" };
var Viewport2 = lazy(() => Promise.resolve().then(() => (init_viewport(), viewport_exports)).then((m) => ({ default: m.Viewport })));
function ViewportFallback() {
  const t = useLocale().viewport;
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-[hsl(var(--background))]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-mono", children: t.initialisingRenderer })
  ] }) });
}
function GlassCard({ children, className }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "backdrop-blur-xl bg-black/30 dark:bg-black/40",
        "border border-white/15 dark:border-white/10",
        "rounded-2xl shadow-2xl shadow-black/20",
        className
      ),
      children
    }
  );
}
function WorkspaceLayout({ className }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [renderSettingsOpen, setRenderSettingsOpen] = useState(false);
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const { fps, pointBudget, activeTool, selectedCamera, uiMode, clipBoxEntries } = useViewer();
  const { metadata } = useData();
  const t = useLocale().viewport;
  const isPro = uiMode === "professional";
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "relative h-full w-full bg-[hsl(var(--background))] text-foreground overflow-hidden",
        // Publish the minimap's right offset so it sits just left of the sidebar
        // when open and snaps back to the edge when closed (the minimap, inside
        // the viewport, consumes `--pcv-minimap-right`).
        sidebarOpen ? "[--pcv-minimap-right:19.25rem] xl:[--pcv-minimap-right:21.25rem]" : "[--pcv-minimap-right:0.75rem]",
        className
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ViewportFallback, {}), children: /* @__PURE__ */ jsx(Viewport2, {}) }) }),
        selectedCamera && /* @__PURE__ */ jsx(PanoViewer, {}),
        /* @__PURE__ */ jsx(RenderingSettings, { open: renderSettingsOpen, onClose: () => setRenderSettingsOpen(false) }),
        isPro && quickSettingsOpen && /* @__PURE__ */ jsx(QuickSettingsPopover, { onClose: () => setQuickSettingsOpen(false) }),
        /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none", style: chromeScale, children: /* @__PURE__ */ jsx(GlassCard, { className: "pointer-events-auto", children: /* @__PURE__ */ jsx(
          MainToolbar,
          {
            onToggleRenderSettings: isPro ? () => setRenderSettingsOpen((o) => !o) : void 0,
            renderSettingsOpen,
            onToggleQuickSettings: isPro ? () => setQuickSettingsOpen((o) => !o) : void 0,
            quickSettingsOpen
          }
        ) }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute left-3 top-14 bottom-14 z-30 pointer-events-none flex items-center", style: chromeScale, children: /* @__PURE__ */ jsx(GlassCard, { className: "pointer-events-auto overflow-y-auto max-h-full", children: /* @__PURE__ */ jsx(ToolRail, {}) }) }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn(
              "absolute top-16 bottom-10 right-3 z-30 w-72 xl:w-80",
              "transition-transform duration-200",
              sidebarOpen ? "translate-x-0" : "translate-x-[calc(100%+0.75rem)]"
            ),
            style: chromeScale,
            children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setSidebarOpen((o) => !o),
                  title: sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
                  "aria-label": sidebarOpen ? "Collapse sidebar" : "Expand sidebar",
                  className: cn(
                    "absolute top-1/2 -translate-y-1/2 -left-7 z-40",
                    "flex items-center justify-center w-7 h-16 rounded-l-lg",
                    "backdrop-blur-xl bg-black/45 dark:bg-black/55",
                    "border border-r-0 border-white/25 dark:border-white/20",
                    "shadow-2xl shadow-black/30",
                    "text-white/80 hover:text-[hsl(var(--brand))] hover:bg-black/55 transition-colors"
                  ),
                  children: sidebarOpen ? /* @__PURE__ */ jsx(ChevronRight, { size: 18 }) : /* @__PURE__ */ jsx(ChevronLeft, { size: 18 })
                }
              ),
              /* @__PURE__ */ jsx(GlassCard, { className: "h-full overflow-hidden", children: /* @__PURE__ */ jsx(Sidebar, {}) })
            ]
          }
        ),
        isPro && clipBoxEntries.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute bottom-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none", style: chromeScale, children: /* @__PURE__ */ jsx(GlassCard, { className: "pointer-events-auto", children: /* @__PURE__ */ jsx(ClipToolbar, {}) }) }),
        /* @__PURE__ */ jsx("div", { className: "absolute bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none", style: chromeScale, children: /* @__PURE__ */ jsx(GlassCard, { className: "pointer-events-none", children: /* @__PURE__ */ jsxs("div", { className: "px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-white/50 select-none", children: [
          metadata && /* @__PURE__ */ jsx("span", { children: t.statusPts(metadata.points / 1e6) }),
          /* @__PURE__ */ jsx("span", { children: t.statusBudget(pointBudget / 1e6) }),
          /* @__PURE__ */ jsx("span", { children: t.statusFps(fps) }),
          activeTool !== "none" && /* @__PURE__ */ jsx("span", { className: "text-[hsl(var(--brand))]", children: activeTool })
        ] }) }) })
      ]
    }
  );
}

// src/ui/button.tsx
init_utils();
var buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/.85)]",
        secondary: "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary)/.8)]",
        ghost: "hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
        outline: "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]",
        destructive: "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] hover:bg-[hsl(var(--destructive)/.85)]"
      },
      size: {
        sm: "h-7 px-2.5 text-xs",
        md: "h-9 px-4",
        icon: "h-8 w-8 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
var Button = React25.forwardRef(
  ({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsx(
    "button",
    {
      ref,
      className: cn(buttonVariants({ variant, size }), className),
      ...props
    }
  )
);
Button.displayName = "Button";

// src/ui/slider.tsx
init_utils();
var Slider2 = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs(
  SliderPrimitive.Root,
  {
    ref,
    className: cn(
      "relative flex w-full touch-none select-none items-center",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx(SliderPrimitive.Track, { className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-[hsl(var(--muted))]", children: /* @__PURE__ */ jsx(SliderPrimitive.Range, { className: "absolute h-full bg-[hsl(var(--primary))]" }) }),
      /* @__PURE__ */ jsx(SliderPrimitive.Thumb, { className: "block h-4 w-4 rounded-full border border-[hsl(var(--primary))] bg-[hsl(var(--background))] shadow transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50" })
    ]
  }
));
Slider2.displayName = "Slider";

// src/ui/dialog.tsx
init_utils();
var Dialog = DialogPrimitive.Root;
var DialogTrigger = DialogPrimitive.Trigger;
var DialogPortal = DialogPrimitive.Portal;
var DialogOverlay = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn("fixed inset-0 z-50 bg-black/50", className),
    ...props
  }
));
DialogOverlay.displayName = "DialogOverlay";
var DialogContent = React25.forwardRef(({ className, children, container, dragOffset, style, ...props }, ref) => {
  const dx = dragOffset?.x ?? 0;
  const dy = dragOffset?.y ?? 0;
  return /* @__PURE__ */ jsxs(DialogPortal, { container: container ?? void 0, children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsx(
      DialogPrimitive.Content,
      {
        ref,
        className: cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-xl",
          className
        ),
        style: {
          ...style,
          transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px)`
        },
        ...props,
        children
      }
    )
  ] });
});
DialogContent.displayName = "DialogContent";
var DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn(
      "flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
var DialogTitle = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-sm font-semibold", className),
    ...props
  }
));
DialogTitle.displayName = "DialogTitle";
var DialogClose = React25.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Close,
  {
    ref,
    className: cn(
      "rounded p-1 text-muted-foreground hover:bg-[hsl(var(--muted)/.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
      className
    ),
    ...props,
    children: children ?? /* @__PURE__ */ jsx(X, { size: 14 })
  }
));
DialogClose.displayName = "DialogClose";

// src/ui/tabs.tsx
init_utils();
var Tabs = TabsPrimitive.Root;
var TabsList = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "flex gap-1 border-b border-[hsl(var(--border))]",
      className
    ),
    ...props
  }
));
TabsList.displayName = "TabsList";
var TabsTrigger = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "px-3 py-1.5 text-xs font-medium text-muted-foreground -mb-px transition-colors",
      "data-[state=active]:text-[hsl(var(--foreground))] data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--brand))]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = "TabsTrigger";
var TabsContent = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
      className
    ),
    ...props
  }
));
TabsContent.displayName = "TabsContent";

// src/ui/popover.tsx
init_utils();
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverAnchor = PopoverPrimitive.Anchor;
var PopoverContent = React25.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-4 text-[hsl(var(--popover-foreground))] shadow-md outline-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = "PopoverContent";

// src/ui/tooltip.tsx
init_utils();
var TooltipProvider = TooltipPrimitive.Provider;
var Tooltip = TooltipPrimitive.Root;
var TooltipTrigger = TooltipPrimitive.Trigger;
var TooltipContent = React25.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(TooltipPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] px-3 py-1.5 text-xs text-[hsl(var(--popover-foreground))] shadow-md",
      "animate-in fade-in-0 zoom-in-95",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
) }));
TooltipContent.displayName = "TooltipContent";

// src/ui/toggle.tsx
init_utils();
var toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-transparent hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--muted-foreground))] data-[state=on]:bg-[hsl(var(--accent))] data-[state=on]:text-[hsl(var(--accent-foreground))]",
        outline: "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] data-[state=on]:bg-[hsl(var(--accent))] data-[state=on]:text-[hsl(var(--accent-foreground))]"
      },
      size: {
        sm: "h-7 px-2 text-xs",
        md: "h-9 px-3",
        icon: "h-8 w-8 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
);
var Toggle = React25.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ jsx(
  TogglePrimitive.Root,
  {
    ref,
    className: cn(toggleVariants({ variant, size }), className),
    ...props
  }
));
Toggle.displayName = "Toggle";

// src/ui/select.tsx
init_utils();
var Select = SelectPrimitive.Root;
var SelectGroup = SelectPrimitive.Group;
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = React25.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--foreground))] shadow-sm",
      "placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "[&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50 shrink-0" }) })
    ]
  }
));
SelectTrigger.displayName = "SelectTrigger";
var SelectScrollUpButton = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = "SelectScrollUpButton";
var SelectScrollDownButton = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";
var SelectContent = React25.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] text-[hsl(var(--popover-foreground))] shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = "SelectContent";
var SelectLabel = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn(
      "px-2 py-1.5 text-xs font-semibold text-muted-foreground",
      className
    ),
    ...props
  }
));
SelectLabel.displayName = "SelectLabel";
var SelectItem = React25.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      "focus:bg-[hsl(var(--accent))] focus:text-[hsl(var(--accent-foreground))]",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = "SelectItem";
var SelectSeparator = React25.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-[hsl(var(--border))]", className),
    ...props
  }
));
SelectSeparator.displayName = "SelectSeparator";
var defaultComponents = {
  Button,
  Slider: Slider2,
  Toggle,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Popover,
  PopoverTrigger,
  PopoverContent,
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator
};
var ComponentsContext = createContext(defaultComponents);
function ComponentsProvider({
  components,
  children
}) {
  const merged = useMemo(
    () => components ? { ...defaultComponents, ...components } : defaultComponents,
    [components]
  );
  return /* @__PURE__ */ jsx(ComponentsContext.Provider, { value: merged, children });
}
function useComponents() {
  return useContext(ComponentsContext);
}

// src/components/pano-cloud-viewer.tsx
init_dist();
init_utils();
var Viewport4 = lazy(() => Promise.resolve().then(() => (init_viewport(), viewport_exports)).then((m) => ({ default: m.Viewport })));
var PcvRootContext = createContext(null);
function usePcvRoot() {
  return useContext(PcvRootContext);
}
var UiScaleContext = createContext(1);
function ViewportFallback2() {
  return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-[hsl(var(--background))]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3", children: [
    /* @__PURE__ */ jsx("div", { className: "w-8 h-8 border-2 border-[hsl(var(--brand))] border-t-transparent rounded-full animate-spin" }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-mono", children: "Initialising renderer\u2026" })
  ] }) });
}
function PanoOverlayBridge() {
  const { selectedCamera } = useViewer();
  if (!selectedCamera) return null;
  return /* @__PURE__ */ jsx(PanoViewer, {});
}
function PcvRoot({ className, uiScale = 1, children }) {
  const { resolvedTheme } = useTheme();
  const rootRef = useRef(null);
  const rootStyle = { "--pcv-scale": uiScale };
  return /* @__PURE__ */ jsx(PcvRootContext.Provider, { value: rootRef, children: /* @__PURE__ */ jsx(UiScaleContext.Provider, { value: uiScale, children: /* @__PURE__ */ jsx(
    "div",
    {
      ref: rootRef,
      className: cn("pcv", resolvedTheme, "w-full h-full", className),
      "data-theme": resolvedTheme,
      style: rootStyle,
      children
    }
  ) }) });
}
function PanoCloudViewer({ source, theme = "dark", className, locale, uiMode, panoEngine, basemap, uiScale = 1, children, components }) {
  const adapter = createAdapter(source);
  const config = { source, uiMode, panoEngine, basemap };
  return /* @__PURE__ */ jsx(LocaleProvider, { locale, children: /* @__PURE__ */ jsx(ThemeProvider, { defaultTheme: theme, children: /* @__PURE__ */ jsx(DataProvider, { adapter, children: /* @__PURE__ */ jsx(ViewerProvider, { config, children: /* @__PURE__ */ jsx(ComponentsProvider, { components, children: /* @__PURE__ */ jsx(PcvRoot, { className, uiScale, children: children ? /* @__PURE__ */ jsxs(Fragment, { children: [
    children(
      /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ViewportFallback2, {}), children: /* @__PURE__ */ jsx(Viewport4, {}) })
    ),
    /* @__PURE__ */ jsx(PanoOverlayBridge, {})
  ] }) : /* @__PURE__ */ jsx(WorkspaceLayout, {}) }) }) }) }) }) });
}

// src/index.ts
init_viewer_provider();
init_data_provider();

// src/layouts/minimal/minimal-toolbar.tsx
init_utils();
init_viewer_provider();

// src/layouts/minimal/minimal-settings-popover.tsx
init_utils();
init_viewer_provider();
var COLOR_MODES3 = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "classification", label: "Classification" }
];
function ToggleRow({
  icon,
  label,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: "flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors",
      children: [
        /* @__PURE__ */ jsx("span", { className: cn("text-white/50", active && "text-[hsl(var(--brand))]"), children: icon }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-white/80 flex-1 text-left", children: label }),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "w-7 h-4 rounded-full transition-colors flex items-center px-0.5",
              active ? "bg-[hsl(var(--brand)/0.6)]" : "bg-white/15"
            ),
            children: /* @__PURE__ */ jsx(
              "div",
              {
                className: cn(
                  "w-3 h-3 rounded-full bg-white transition-transform",
                  active && "translate-x-3"
                )
              }
            )
          }
        )
      ]
    }
  );
}
function MinimalSettingsPopover({ onClose }) {
  const {
    showMarkers,
    setShowMarkers,
    showMinimap,
    setShowMinimap,
    showMeasurements,
    setShowMeasurements,
    colorMode,
    setColorMode,
    pointSize,
    setPointSize,
    loader
  } = useViewer();
  return /* @__PURE__ */ jsx("div", { className: "absolute bottom-20 right-8 z-30", children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "w-56 p-3 space-y-3",
        "backdrop-blur-xl bg-black/30 dark:bg-black/40",
        "border border-white/15 dark:border-white/10",
        "rounded-xl shadow-2xl shadow-black/20"
      ),
      children: [
        /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Layers" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ jsx(
            ToggleRow,
            {
              icon: /* @__PURE__ */ jsx(Camera, { size: 14 }),
              label: "Panoramas",
              active: showMarkers,
              onClick: () => setShowMarkers(!showMarkers)
            }
          ),
          /* @__PURE__ */ jsx(
            ToggleRow,
            {
              icon: /* @__PURE__ */ jsx(Ruler, { size: 14 }),
              label: "Measurements",
              active: showMeasurements,
              onClick: () => setShowMeasurements(!showMeasurements)
            }
          ),
          /* @__PURE__ */ jsx(
            ToggleRow,
            {
              icon: /* @__PURE__ */ jsx(Map$1, { size: 14 }),
              label: "Minimap",
              active: showMinimap,
              onClick: () => setShowMinimap(!showMinimap)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Color" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1", children: COLOR_MODES3.map((cm) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setColorMode(cm.value);
                loader?.setColorMode(cm.value);
              },
              className: cn(
                "text-[10px] py-1 px-2 rounded-lg transition-colors",
                colorMode === cm.value ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))]" : "text-white/60 hover:text-white hover:bg-white/10"
              ),
              children: cm.label
            },
            cm.value
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-mono uppercase tracking-widest text-white/40 px-1", children: "Point Size" }),
          /* @__PURE__ */ jsx("div", { className: "px-1", children: /* @__PURE__ */ jsx(
            "input",
            {
              type: "range",
              min: 0.5,
              max: 5,
              step: 0.1,
              value: pointSize,
              onChange: (e) => {
                const v = parseFloat(e.target.value);
                setPointSize(v);
                loader?.setPointSize(v);
              },
              className: "pcv-slider w-full"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-white/10 pt-2 px-1", children: /* @__PURE__ */ jsxs("p", { className: "text-[9px] font-mono text-white/35 leading-tight", title: "Viewer version \xB7 build", children: [
          "v",
          PCV_VERSION,
          " \xB7 ",
          PCV_BUILD
        ] }) })
      ]
    }
  ) });
}
function GlassButton({
  icon,
  active,
  onClick,
  title,
  className
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      title,
      onClick,
      className: cn(
        "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
        active ? "bg-[hsl(var(--brand)/0.25)] text-[hsl(var(--brand))] shadow-[0_0_12px_hsl(var(--brand)/0.3)]" : "text-white/70 hover:text-white hover:bg-white/10",
        className
      ),
      children: icon
    }
  );
}
function Separator2() {
  return /* @__PURE__ */ jsx("div", { className: "w-px h-6 bg-white/15 mx-0.5" });
}
function MinimalToolbar() {
  const {
    activeTool,
    setActiveTool,
    navigationMode,
    setNavigationMode,
    sceneManager,
    loader
  } = useViewer();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const toggleMeasure = useCallback(
    (tool) => {
      setActiveTool(activeTool === tool ? "none" : tool);
    },
    [activeTool, setActiveTool]
  );
  const fitToView = useCallback(() => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (!wb.isEmpty()) sceneManager.fitToBox(wb);
  }, [sceneManager, loader]);
  const isMeasuring = activeTool.startsWith("measure-");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-4 left-1/2 -translate-x-1/2 z-30", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "flex items-center gap-0.5 px-2 py-1.5",
          "backdrop-blur-xl bg-black/30 dark:bg-black/40",
          "border border-white/15 dark:border-white/10",
          "rounded-2xl shadow-2xl shadow-black/20"
        ),
        children: [
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Orbit, { size: 16 }),
              title: "Orbit",
              active: navigationMode === "orbit",
              onClick: () => setNavigationMode("orbit")
            }
          ),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Rotate3d, { size: 16 }),
              title: "Free rotate",
              active: navigationMode === "free",
              onClick: () => setNavigationMode("free")
            }
          ),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Map$1, { size: 16 }),
              title: "Pan / Map",
              active: navigationMode === "pan",
              onClick: () => setNavigationMode("pan")
            }
          ),
          /* @__PURE__ */ jsx(Separator2, {}),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Maximize, { size: 16 }),
              title: "Fit to view",
              onClick: fitToView
            }
          ),
          /* @__PURE__ */ jsx(Separator2, {}),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Ruler, { size: 16 }),
              title: "Distance",
              active: activeTool === "measure-distance",
              onClick: () => toggleMeasure("measure-distance")
            }
          ),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(ArrowUpDown, { size: 16 }),
              title: "Height",
              active: activeTool === "measure-height",
              onClick: () => toggleMeasure("measure-height")
            }
          ),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Pentagon, { size: 16 }),
              title: "Area",
              active: activeTool === "measure-area",
              onClick: () => toggleMeasure("measure-area")
            }
          ),
          isMeasuring && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Separator2, {}),
            /* @__PURE__ */ jsx(
              GlassButton,
              {
                icon: /* @__PURE__ */ jsx(X, { size: 16 }),
                title: "Cancel measurement",
                onClick: () => setActiveTool("none"),
                className: "text-red-400/80 hover:text-red-400 hover:bg-red-500/10"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Separator2, {}),
          /* @__PURE__ */ jsx(
            GlassButton,
            {
              icon: /* @__PURE__ */ jsx(Settings, { size: 16 }),
              title: "View settings",
              active: settingsOpen,
              onClick: () => setSettingsOpen(!settingsOpen)
            }
          )
        ]
      }
    ) }),
    settingsOpen && /* @__PURE__ */ jsx(MinimalSettingsPopover, { onClose: () => setSettingsOpen(false) })
  ] });
}
var chromeScale2 = { zoom: "var(--pcv-scale, 1)" };
function MinimalLayout({ viewport }) {
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: viewport }),
    /* @__PURE__ */ jsx("div", { style: chromeScale2, children: /* @__PURE__ */ jsx(MinimalToolbar, {}) })
  ] });
}

// src/layouts/workstation/workstation-layout.tsx
init_viewer_provider();
init_data_provider();

// src/layouts/workstation/collapsible-sidebar.tsx
init_utils();
function CollapsibleSidebar({ side, children, defaultOpen = true, width = "w-60" }) {
  const [open, setOpen] = useState(defaultOpen);
  const isLeft = side === "left";
  const ChevronIcon = open ? isLeft ? ChevronLeft : ChevronRight : isLeft ? ChevronRight : ChevronLeft;
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "absolute top-0 bottom-0 z-20 flex",
    isLeft ? "left-0" : "right-0",
    isLeft ? "flex-row" : "flex-row-reverse"
  ), children: [
    /* @__PURE__ */ jsx("div", { className: cn(
      "h-full overflow-y-auto overflow-x-hidden transition-all duration-200 bg-[hsl(var(--background)/0.95)] backdrop-blur-sm",
      isLeft ? "border-r" : "border-l",
      "border-[hsl(var(--border))]",
      open ? width : "w-0"
    ), children: open && /* @__PURE__ */ jsx("div", { className: "p-2 space-y-2 min-w-[230px]", children }) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setOpen(!open),
        className: cn(
          "self-center -mx-px z-10",
          "flex items-center justify-center w-5 h-10 rounded-md",
          "bg-[hsl(var(--card))] border border-[hsl(var(--border))]",
          "text-muted-foreground hover:text-foreground transition-colors",
          "shadow-md"
        ),
        children: /* @__PURE__ */ jsx(ChevronIcon, { size: 14 })
      }
    )
  ] });
}

// src/layouts/workstation/tools-palette.tsx
init_utils();
init_viewer_provider();

// src/layouts/workstation/floating-palette.tsx
init_utils();
function FloatingPalette({ title, icon, children, defaultCollapsed = false, className }) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return /* @__PURE__ */ jsxs("div", { className: cn(
    "rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden",
    "min-w-[220px]",
    className
  ), children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setCollapsed(!collapsed),
        className: "flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] hover:bg-muted/40 transition-colors",
        children: [
          icon && /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: icon }),
          /* @__PURE__ */ jsx("span", { className: "flex-1 text-left", children: title }),
          collapsed ? /* @__PURE__ */ jsx(ChevronDown, { size: 12 }) : /* @__PURE__ */ jsx(ChevronUp, { size: 12 })
        ]
      }
    ),
    !collapsed && /* @__PURE__ */ jsx("div", { className: "px-3 pb-3 pt-1 space-y-2 border-t border-[hsl(var(--border))]", children })
  ] });
}
function ToolBtn({ icon, label, active, onClick, disabled }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      title: label,
      onClick,
      disabled,
      className: cn(
        "flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs transition-colors",
        active ? "bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        disabled && "opacity-30 cursor-not-allowed"
      ),
      children: [
        icon,
        /* @__PURE__ */ jsx("span", { children: label })
      ]
    }
  );
}
var MEASURE_TOOLS = [
  { tool: "measure-point", icon: /* @__PURE__ */ jsx(MapPin, { size: 14 }), label: "Point" },
  { tool: "measure-distance", icon: /* @__PURE__ */ jsx(Ruler, { size: 14 }), label: "Distance" },
  { tool: "measure-height", icon: /* @__PURE__ */ jsx(ArrowUpDown, { size: 14 }), label: "Height" },
  { tool: "measure-area", icon: /* @__PURE__ */ jsx(Pentagon, { size: 14 }), label: "Area" },
  { tool: "measure-volume", icon: /* @__PURE__ */ jsx(Package, { size: 14 }), label: "Volume" },
  { tool: "measure-angle", icon: /* @__PURE__ */ jsx(Triangle, { size: 14 }), label: "Angle" },
  { tool: "measure-profile", icon: /* @__PURE__ */ jsx(Waypoints, { size: 14 }), label: "Profile" }
];
function ToolsPalette() {
  const { activeTool, setActiveTool, clipManager, loader, measurementManager, setMeasurementList, clipBoxEntries } = useViewer();
  const toggle = useCallback((tool) => {
    setActiveTool(activeTool === tool ? "none" : tool);
  }, [activeTool, setActiveTool]);
  const hasClipBox = clipBoxEntries.length > 0;
  const clipMode = clipBoxEntries[0]?.mode ?? "outside";
  const addClipBox = useCallback(() => {
    if (!clipManager || !loader) return;
    if (loader.worldBox.isEmpty()) return;
    const entry = clipManager.addDefaultBox(loader.worldBox);
    clipManager.selectBox(entry.id);
  }, [clipManager, loader]);
  const clearClipBox = useCallback(() => {
    clipManager?.clear();
    if (activeTool === "section-box") setActiveTool("none");
  }, [clipManager, activeTool, setActiveTool]);
  const toggleClipMode = useCallback(() => {
    const next = clipMode === "outside" ? "inside" : "outside";
    for (const b of clipBoxEntries) clipManager?.setBoxMode(b.id, next);
  }, [clipManager, clipBoxEntries, clipMode]);
  return /* @__PURE__ */ jsxs(FloatingPalette, { title: "Tools", icon: /* @__PURE__ */ jsx(Ruler, { size: 12 }), children: [
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1", children: "Measure" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
      MEASURE_TOOLS.map((def) => /* @__PURE__ */ jsx(ToolBtn, { icon: def.icon, label: def.label, active: activeTool === def.tool, onClick: () => toggle(def.tool) }, def.tool)),
      /* @__PURE__ */ jsx(ToolBtn, { icon: /* @__PURE__ */ jsx(X, { size: 14 }), label: "Clear All", onClick: () => {
        measurementManager?.clearAll();
        setMeasurementList([]);
      } })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-3 mb-1", children: "Clipping" }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
      /* @__PURE__ */ jsx(ToolBtn, { icon: /* @__PURE__ */ jsx(BoxSelect, { size: 14 }), label: hasClipBox ? "Remove Clip Box" : "Add Clip Box", active: hasClipBox, onClick: hasClipBox ? clearClipBox : addClipBox }),
      hasClipBox && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(ToolBtn, { icon: /* @__PURE__ */ jsx(Scissors, { size: 14 }), label: `Mode: ${clipMode === "outside" ? "Keep Inside" : "Keep Outside"}`, onClick: toggleClipMode }),
        /* @__PURE__ */ jsx(ToolBtn, { icon: /* @__PURE__ */ jsx(RotateCcw, { size: 14 }), label: "Clear Clips", onClick: clearClipBox })
      ] })
    ] })
  ] });
}

// src/layouts/workstation/display-palette.tsx
init_utils();
init_viewer_provider();
var COLOR_MODES4 = [
  { value: "rgb", label: "RGB" },
  { value: "height", label: "Elevation" },
  { value: "intensity", label: "Intensity" },
  { value: "intensity_gradient", label: "Intensity Grad." },
  { value: "classification", label: "Classification" },
  { value: "return_number", label: "Return #" },
  { value: "source", label: "Source" }
];
var QUALITY_PRESETS2 = [
  { label: "Perf", shape: 0, sizeType: 0 },
  { label: "Balanced", shape: 1, sizeType: 2 },
  { label: "High", shape: 2, sizeType: 2 }
];
function DisplayPalette() {
  const { loader, colorMode, setColorMode, pointBudget, setPointBudget, pointSize, setPointSize } = useViewer();
  return /* @__PURE__ */ jsxs(FloatingPalette, { title: "Display", icon: /* @__PURE__ */ jsx(Palette, { size: 12 }), children: [
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1", children: "Color" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: COLOR_MODES4.map((cm) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          setColorMode(cm.value);
          loader?.setColorMode(cm.value);
        },
        className: cn(
          "text-[10px] px-2 py-0.5 rounded transition-colors",
          colorMode === cm.value ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        ),
        children: cm.label
      },
      cm.value
    )) }),
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-3 mb-1", children: "Quality" }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: QUALITY_PRESETS2.map((q) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => {
          loader?.setPointShape(q.shape);
          loader?.setPointSizeType(q.sizeType);
        },
        className: "text-[10px] px-2 py-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors",
        children: q.label
      },
      q.label
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 mt-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mb-0.5", children: [
          /* @__PURE__ */ jsx("span", { children: "Budget" }),
          /* @__PURE__ */ jsxs("span", { children: [
            (pointBudget / 1e6).toFixed(1),
            "M"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: 5e5,
            max: 1e7,
            step: 1e5,
            value: pointBudget,
            onChange: (e) => {
              const v = parseInt(e.target.value);
              setPointBudget(v);
              loader?.setPointBudget(v);
            },
            className: "pcv-slider w-full"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground mb-0.5", children: [
          /* @__PURE__ */ jsx("span", { children: "Point Size" }),
          /* @__PURE__ */ jsx("span", { children: pointSize.toFixed(1) })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "range",
            min: 0.5,
            max: 5,
            step: 0.1,
            value: pointSize,
            onChange: (e) => {
              const v = parseFloat(e.target.value);
              setPointSize(v);
              loader?.setPointSize(v);
            },
            className: "pcv-slider w-full"
          }
        )
      ] })
    ] })
  ] });
}

// src/layouts/workstation/view-settings-palette.tsx
init_utils();
init_viewer_provider();
function ToggleRow2({ icon, label, active, onClick }) {
  return /* @__PURE__ */ jsxs("button", { onClick, className: "flex items-center gap-2 w-full px-1 py-1 rounded text-xs hover:bg-muted/40 transition-colors", children: [
    /* @__PURE__ */ jsx("span", { className: cn("text-muted-foreground", active && "text-[hsl(var(--brand))]"), children: icon }),
    /* @__PURE__ */ jsx("span", { className: "flex-1 text-left text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: cn("w-6 h-3.5 rounded-full transition-colors flex items-center px-0.5", active ? "bg-[hsl(var(--brand)/0.5)]" : "bg-muted/60"), children: /* @__PURE__ */ jsx("div", { className: cn("w-2.5 h-2.5 rounded-full bg-foreground/80 transition-transform", active && "translate-x-2.5") }) })
  ] });
}
function ModeBtn({ icon, label, active, onClick }) {
  return /* @__PURE__ */ jsxs("button", { onClick, className: cn(
    "flex flex-col items-center gap-0.5 px-2 py-1 rounded text-[10px] transition-colors",
    active ? "bg-[hsl(var(--brand)/0.15)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
  ), children: [
    icon,
    /* @__PURE__ */ jsx("span", { children: label })
  ] });
}
function ViewSettingsPalette() {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap, navigationMode, setNavigationMode, projection, setProjection } = useViewer();
  return /* @__PURE__ */ jsxs(FloatingPalette, { title: "View", icon: /* @__PURE__ */ jsx(Eye, { size: 12 }), defaultCollapsed: true, children: [
    /* @__PURE__ */ jsx(ToggleRow2, { icon: /* @__PURE__ */ jsx(Camera, { size: 13 }), label: "Panoramas", active: showMarkers, onClick: () => setShowMarkers(!showMarkers) }),
    /* @__PURE__ */ jsx(ToggleRow2, { icon: /* @__PURE__ */ jsx(Map$1, { size: 13 }), label: "Minimap", active: showMinimap, onClick: () => setShowMinimap(!showMinimap) }),
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-2 mb-1", children: "Navigation" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Orbit, { size: 14 }), label: "Orbit", active: navigationMode === "orbit", onClick: () => setNavigationMode("orbit") }),
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Rotate3d, { size: 14 }), label: "Free", active: navigationMode === "free", onClick: () => setNavigationMode("free") }),
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Map$1, { size: 14 }), label: "Pan", active: navigationMode === "pan", onClick: () => setNavigationMode("pan") })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 mt-2 mb-1", children: "Projection" }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Box, { size: 14 }), label: "Perspective", active: projection === "perspective", onClick: () => setProjection("perspective") }),
      /* @__PURE__ */ jsx(ModeBtn, { icon: /* @__PURE__ */ jsx(Square, { size: 14 }), label: "Ortho", active: projection === "orthographic", onClick: () => setProjection("orthographic") })
    ] })
  ] });
}

// src/layouts/workstation/export-palette.tsx
init_utils();
init_viewer_provider();
init_dist();
var VIEWS = [
  { value: "top", label: "Top" },
  { value: "front", label: "Front" },
  { value: "side", label: "Side" },
  { value: "back", label: "Back" }
];
function ExportPalette() {
  const { exporter } = useViewer();
  const [view, setView] = useState("top");
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState("png");
  const [bg, setBg] = useState("white");
  const [exporting, setExporting] = useState(false);
  const doExport = useCallback(async () => {
    if (!exporter) return;
    setExporting(true);
    try {
      const url = await exporter.capture({ view, scale, background: bg, format, showScaleBar: false });
      ExportManager.download(url, `export-${view}-${scale}x.${format}`);
    } finally {
      setExporting(false);
    }
  }, [exporter, view, scale, bg, format]);
  return /* @__PURE__ */ jsxs(FloatingPalette, { title: "Export", icon: /* @__PURE__ */ jsx(Image, { size: 12 }), defaultCollapsed: true, children: [
    /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: VIEWS.map((v) => /* @__PURE__ */ jsx("button", { onClick: () => setView(v.value), className: cn(
      "text-[10px] px-2 py-0.5 rounded transition-colors",
      view === v.value ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
    ), children: v.label }, v.value)) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mt-1", children: [
      /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [1, 2, 4].map((s) => /* @__PURE__ */ jsxs("button", { onClick: () => setScale(s), className: cn(
        "text-[10px] px-1.5 py-0.5 rounded transition-colors",
        scale === s ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
      ), children: [
        s,
        "x"
      ] }, s)) }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: ["png", "jpeg"].map((f) => /* @__PURE__ */ jsx("button", { onClick: () => setFormat(f), className: cn(
        "text-[10px] px-1.5 py-0.5 rounded transition-colors",
        format === f ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
      ), children: f.toUpperCase() }, f)) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1 mt-1", children: ["white", "black", "transparent"].map((b) => /* @__PURE__ */ jsx("button", { onClick: () => setBg(b), className: cn(
      "text-[10px] px-1.5 py-0.5 rounded transition-colors",
      bg === b ? "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-muted/40"
    ), children: b === "transparent" ? "Alpha" : b }, b)) }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: doExport,
        disabled: !exporter || exporting,
        className: cn(
          "flex items-center justify-center gap-1.5 w-full mt-2 py-1.5 rounded text-xs font-medium transition-colors",
          "bg-[hsl(var(--brand)/0.2)] text-[hsl(var(--brand))] hover:bg-[hsl(var(--brand)/0.3)]",
          (!exporter || exporting) && "opacity-40 cursor-not-allowed"
        ),
        children: [
          /* @__PURE__ */ jsx(Download, { size: 12 }),
          exporting ? "Exporting..." : "Download"
        ]
      }
    )
  ] });
}
var chromeScale3 = { zoom: "var(--pcv-scale, 1)" };
function WorkstationLayout({ viewport, sidebarSide = "left" }) {
  const { fps, pointBudget, activeTool } = useViewer();
  const { metadata } = useData();
  return /* @__PURE__ */ jsxs("div", { className: "relative w-full h-full overflow-hidden bg-[hsl(var(--background))]", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-0", children: viewport }),
    /* @__PURE__ */ jsx("div", { style: chromeScale3, children: /* @__PURE__ */ jsxs(CollapsibleSidebar, { side: sidebarSide, children: [
      /* @__PURE__ */ jsx(ToolsPalette, {}),
      /* @__PURE__ */ jsx(DisplayPalette, {}),
      /* @__PURE__ */ jsx(ViewSettingsPalette, {}),
      /* @__PURE__ */ jsx(ExportPalette, {})
    ] }) }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "absolute bottom-0 left-0 right-0 z-10 px-3 h-6 flex items-center gap-4 text-[10px] font-mono text-muted-foreground/70 bg-[hsl(var(--card)/0.8)] backdrop-blur-sm border-t border-[hsl(var(--border)/0.5)]",
        style: chromeScale3,
        children: [
          metadata && /* @__PURE__ */ jsxs("span", { children: [
            (metadata.points / 1e6).toFixed(1),
            "M pts"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Budget: ",
            (pointBudget / 1e6).toFixed(1),
            "M"
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            fps,
            " fps"
          ] }),
          activeTool !== "none" && /* @__PURE__ */ jsx("span", { className: "text-[hsl(var(--brand))]", children: activeTool })
        ]
      }
    )
  ] });
}

// src/index.ts
init_viewport();

// src/components/toolbar/measure-tools.tsx
init_viewer_provider();
var TOOLS = [
  { type: "point", tool: "measure-point", icon: /* @__PURE__ */ jsx(MapPin, { size: 14 }), title: "Point coordinate" },
  { type: "distance", tool: "measure-distance", icon: /* @__PURE__ */ jsx(Ruler, { size: 14 }), title: "Distance" },
  { type: "height", tool: "measure-height", icon: /* @__PURE__ */ jsx(ArrowUpDown, { size: 14 }), title: "Height" },
  { type: "area", tool: "measure-area", icon: /* @__PURE__ */ jsx(Pentagon, { size: 14 }), title: "Area" },
  { type: "volume", tool: "measure-volume", icon: /* @__PURE__ */ jsx(Package, { size: 14 }), title: "Volume" },
  { type: "angle", tool: "measure-angle", icon: /* @__PURE__ */ jsx(Triangle, { size: 14 }), title: "Angle" },
  { type: "profile", tool: "measure-profile", icon: /* @__PURE__ */ jsx(Waypoints, { size: 14 }), title: "Profile" }
];
function MeasureTools() {
  const { activeTool, setActiveTool } = useViewer();
  const toggle = (tool) => {
    setActiveTool(activeTool === tool ? "none" : tool);
  };
  return /* @__PURE__ */ jsx(Fragment, { children: TOOLS.map((t) => /* @__PURE__ */ jsx(
    ToolbarIconBtn,
    {
      icon: t.icon,
      title: t.title,
      active: activeTool === t.tool,
      onClick: () => toggle(t.tool)
    },
    t.tool
  )) });
}

// src/components/toolbar/section-tools.tsx
init_viewer_provider();
function SectionTools() {
  const { activeTool, setActiveTool, clipManager, loader } = useViewer();
  const addClipBox = () => {
    if (!clipManager || !loader) return;
    const boxes = clipManager.getBoxes();
    if (boxes.length > 0) {
      clipManager.clear();
      return;
    }
    if (loader.worldBox.isEmpty()) return;
    const entry = clipManager.addDefaultBox(loader.worldBox);
    clipManager.selectBox(entry.id);
  };
  const hasClipBox = (clipManager?.getBoxes().length ?? 0) > 0;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      ToolbarIconBtn,
      {
        icon: /* @__PURE__ */ jsx(BoxSelect, { size: 14 }),
        title: "Clipping box",
        active: hasClipBox,
        onClick: addClipBox
      }
    ),
    /* @__PURE__ */ jsx(
      ToolbarIconBtn,
      {
        icon: /* @__PURE__ */ jsx(Slice, { size: 14 }),
        title: "Clipping plane",
        active: activeTool === "section-plane",
        onClick: () => setActiveTool(activeTool === "section-plane" ? "none" : "section-plane")
      }
    )
  ] });
}

// src/components/overlays/about-dialog.tsx
init_locale_context();
init_viewer_provider();
function AboutDialog({ onClose }) {
  const t = useLocale().about;
  const { loader } = useViewer();
  const geo = loader?.getGeoInfo();
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", onClick: onClose, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: "bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl shadow-2xl p-6 w-80 text-sm",
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-[hsl(var(--brand))] font-mono text-xs uppercase tracking-widest", children: t.title }),
          /* @__PURE__ */ jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground transition-colors", children: /* @__PURE__ */ jsx(X, { size: 16 }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "font-bold text-foreground text-base", children: t.productName }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-xs mt-0.5", children: "@der-ort/pano-cloud-viewer" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] font-mono text-muted-foreground/70 mt-1", title: "Viewer version \xB7 build", children: [
            "v",
            PCV_VERSION,
            " \xB7 ",
            PCV_BUILD
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-4", children: t.description }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs text-muted-foreground border-t border-[hsl(var(--border))] pt-3", children: [
          /* @__PURE__ */ jsx("p", { children: t.engineLabel }),
          /* @__PURE__ */ jsx("p", { children: t.panoramasLabel }),
          /* @__PURE__ */ jsx("p", { children: t.uiLabel })
        ] }),
        geo && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground border-t border-[hsl(var(--border))] pt-3 mt-3", children: [
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: "Georeference:" }),
            " ",
            geo.georeferenced ? "yes" : "no (local coordinates)"
          ] }),
          geo.georeferenced && /* @__PURE__ */ jsx("p", { className: "font-mono text-[10px] mt-0.5 break-all", title: geo.projection, children: geo.projection.length > 80 ? geo.projection.slice(0, 80) + "\u2026" : geo.projection })
        ] })
      ]
    }
  ) });
}

// src/components/overlays/display-settings-dialog.tsx
init_utils();
init_viewer_provider();
init_locale_context();
init_dist();
var PRESET_ICONS = {
  compact: /* @__PURE__ */ jsx(Minus, { size: 18 }),
  standard: /* @__PURE__ */ jsx(Circle, { size: 18 }),
  prominent: /* @__PURE__ */ jsx(Plus, { size: 18 })
};
function PresetCard({
  preset,
  label,
  description,
  active,
  onClick
}) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick,
      className: cn(
        "flex flex-col items-center gap-2 rounded-md border p-3 text-center transition-colors",
        "hover:bg-[hsl(var(--muted)/.4)]",
        active ? "border-[hsl(var(--brand))] bg-[hsl(var(--brand)/.08)]" : "border-[hsl(var(--border))]"
      ),
      children: [
        /* @__PURE__ */ jsx(
          "span",
          {
            className: cn(
              "text-muted-foreground",
              active && "text-[hsl(var(--brand))]"
            ),
            children: PRESET_ICONS[preset]
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold", children: label }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] leading-tight text-muted-foreground", children: description })
      ]
    }
  );
}
function SettingsSection({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h4", { className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: title }),
    /* @__PURE__ */ jsx("div", { className: "space-y-3", children })
  ] });
}
function SliderRow({
  label,
  min,
  max,
  step,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "w-24 shrink-0 text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "range",
        className: "pcv-slider flex-1",
        min,
        max,
        step,
        value,
        onChange: (e) => onChange(parseFloat(e.target.value))
      }
    ),
    /* @__PURE__ */ jsx("span", { className: "w-10 text-right text-xs tabular-nums text-muted-foreground", children: value.toFixed(step < 0.1 ? 2 : 1) })
  ] });
}
function SegmentedRow({
  label,
  value,
  options,
  onChange
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "w-24 shrink-0 text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-1 overflow-hidden rounded-md border border-[hsl(var(--border))]", children: options.map((opt, i) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(opt.value),
        className: cn(
          "flex-1 px-2 py-1 text-xs transition-colors",
          i > 0 && "border-l border-[hsl(var(--border))]",
          value === opt.value ? "bg-[hsl(var(--brand)/.15)] font-semibold text-[hsl(var(--brand))]" : "text-muted-foreground hover:bg-[hsl(var(--muted)/.4)]"
        ),
        children: opt.label
      },
      opt.value
    )) })
  ] });
}
function DisplaySettingsDialog({
  open,
  onOpenChange
}) {
  const viewer = useViewer();
  const {
    Dialog: Dialog2,
    DialogContent: DialogContent2,
    DialogHeader: DialogHeader2,
    DialogTitle: DialogTitle2,
    DialogClose: DialogClose2,
    Tabs: Tabs2,
    TabsList: TabsList2,
    TabsTrigger: TabsTrigger2,
    TabsContent: TabsContent2
  } = useComponents();
  const [localSettings, setLocalSettings] = useState(
    DISPLAY_PRESETS.standard
  );
  const settings = viewer.displaySettings ?? localSettings;
  const setSettings = viewer.setDisplaySettings ?? setLocalSettings;
  const t = useLocale().displaySettings;
  const tx = t;
  const isDe = t.advancedTab === "Erweitert";
  const labelStr = {
    markerLabels: isDe ? "Beschriftungen" : "Labels",
    markerLabelHover: isDe ? "Bei Hover" : "On hover",
    markerLabelAlways: isDe ? "Immer" : "Always",
    markerLabelHidden: isDe ? "Aus" : "Hidden"
  };
  const pcvRoot = usePcvRoot();
  const { position, onDragStart, reset } = useDraggable();
  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);
  const applyPreset = (preset) => {
    setSettings({ ...DISPLAY_PRESETS[preset] });
  };
  const updateField = (key, value) => {
    setSettings({ ...settings, [key]: value, preset: settings.preset });
  };
  return /* @__PURE__ */ jsx(Dialog2, { open, onOpenChange, children: /* @__PURE__ */ jsxs(
    DialogContent2,
    {
      className: "w-[420px]",
      container: pcvRoot?.current ?? void 0,
      dragOffset: position,
      children: [
        /* @__PURE__ */ jsxs(
          DialogHeader2,
          {
            className: "cursor-move select-none",
            onMouseDown: onDragStart,
            children: [
              /* @__PURE__ */ jsx(DialogTitle2, { children: t.title }),
              /* @__PURE__ */ jsx(DialogClose2, { onMouseDown: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(X, { size: 14 }) })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(Tabs2, { defaultValue: "presets", className: "px-4 py-3", children: [
          /* @__PURE__ */ jsxs(TabsList2, { className: "mb-4", children: [
            /* @__PURE__ */ jsx(TabsTrigger2, { value: "presets", children: t.presetsTab }),
            /* @__PURE__ */ jsx(TabsTrigger2, { value: "advanced", children: t.advancedTab })
          ] }),
          /* @__PURE__ */ jsx(TabsContent2, { value: "presets", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-3", children: ["compact", "standard", "prominent"].map(
            (preset) => /* @__PURE__ */ jsx(
              PresetCard,
              {
                preset,
                label: t[`preset_${preset}`] ?? preset,
                description: t[`preset_${preset}_desc`] ?? "",
                active: settings.preset === preset,
                onClick: () => applyPreset(preset)
              },
              preset
            )
          ) }) }),
          /* @__PURE__ */ jsx(TabsContent2, { value: "advanced", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs(SettingsSection, { title: t.measurementsSection, children: [
              /* @__PURE__ */ jsx(
                SliderRow,
                {
                  label: t.lineWidth,
                  min: 1,
                  max: 6,
                  step: 0.5,
                  value: settings.measurementLineWidth,
                  onChange: (v) => updateField("measurementLineWidth", v)
                }
              ),
              /* @__PURE__ */ jsx(
                SliderRow,
                {
                  label: t.labelScale,
                  min: 0.3,
                  max: 2.5,
                  step: 0.1,
                  value: settings.measurementLabelScale,
                  onChange: (v) => updateField("measurementLabelScale", v)
                }
              ),
              /* @__PURE__ */ jsx(
                SliderRow,
                {
                  label: t.sphereRadius,
                  min: 0.02,
                  max: 0.5,
                  step: 0.01,
                  value: settings.measurementSphereRadius,
                  onChange: (v) => updateField("measurementSphereRadius", v)
                }
              )
            ] }),
            /* @__PURE__ */ jsxs(SettingsSection, { title: t.markersSection, children: [
              /* @__PURE__ */ jsx(
                SliderRow,
                {
                  label: t.markerScale,
                  min: 0.2,
                  max: 3,
                  step: 0.1,
                  value: settings.markerSphereScale,
                  onChange: (v) => updateField("markerSphereScale", v)
                }
              ),
              /* @__PURE__ */ jsx(
                SliderRow,
                {
                  label: t.markerOpacity,
                  min: 0.1,
                  max: 1,
                  step: 0.05,
                  value: settings.markerSphereOpacity,
                  onChange: (v) => updateField("markerSphereOpacity", v)
                }
              ),
              /* @__PURE__ */ jsx(
                SliderRow,
                {
                  label: t.markerLabelScale,
                  min: 0.3,
                  max: 2.5,
                  step: 0.1,
                  value: settings.markerLabelScale,
                  onChange: (v) => updateField("markerLabelScale", v)
                }
              ),
              /* @__PURE__ */ jsx(
                SegmentedRow,
                {
                  label: tx.markerLabels ?? labelStr.markerLabels,
                  value: settings.markerLabelMode ?? "hover",
                  options: [
                    { value: "hover", label: tx.markerLabelHover ?? labelStr.markerLabelHover },
                    { value: "always", label: tx.markerLabelAlways ?? labelStr.markerLabelAlways },
                    { value: "hidden", label: tx.markerLabelHidden ?? labelStr.markerLabelHidden }
                  ],
                  onChange: (v) => updateField("markerLabelMode", v)
                }
              )
            ] })
          ] }) })
        ] })
      ]
    }
  ) });
}

// src/hooks/use-navigation-actions.ts
init_viewer_provider();
function useNavigationActions() {
  const { sceneManager, loader, navigationMode, setNavigationMode, projection, setProjection } = useViewer();
  const fitToView = useCallback(() => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (!wb.isEmpty()) sceneManager.fitToBox(wb);
  }, [sceneManager, loader]);
  const flyToView = useCallback((preset) => {
    if (!sceneManager || !loader) return;
    const wb = loader.worldBox;
    if (wb.isEmpty()) return;
    const cam = sceneManager.camera;
    const controls = sceneManager.controls;
    const target = controls.target.clone();
    const dist = cam.position.distanceTo(target);
    const dirs = {
      top: [0, 0, 1],
      bottom: [0, 0, -1],
      front: [0, -1, 0],
      back: [0, 1, 0],
      left: [-1, 0, 0],
      right: [1, 0, 0]
    };
    const [dx, dy, dz] = dirs[preset];
    setProjection("orthographic");
    cam.position.set(
      target.x + dx * dist,
      target.y + dy * dist,
      target.z + dz * dist
    );
    cam.up.set(0, preset === "top" || preset === "bottom" ? 1 : 0, preset === "top" || preset === "bottom" ? 0 : 1);
    controls.update();
  }, [sceneManager, loader, setProjection]);
  return {
    navigationMode,
    setNavigationMode,
    projection,
    setProjection,
    fitToView,
    flyToView
  };
}

// src/hooks/use-measurement-actions.ts
init_viewer_provider();
init_utils();
function useMeasurementActions() {
  const { activeTool, setActiveTool, measurementManager, measurementList, setMeasurementList } = useViewer();
  const startTool = useCallback((type) => {
    const tool = `measure-${type}`;
    setActiveTool(activeTool === tool ? "none" : tool);
  }, [activeTool, setActiveTool]);
  const cancelTool = useCallback(() => {
    setActiveTool("none");
  }, [setActiveTool]);
  const clearAll = useCallback(() => {
    measurementManager?.clearAll();
    setMeasurementList([]);
  }, [measurementManager, setMeasurementList]);
  const remove = useCallback((id) => {
    measurementManager?.remove(id);
  }, [measurementManager]);
  const rename2 = useCallback((id, name) => {
    measurementManager?.rename(id, name);
  }, [measurementManager]);
  const exportCSV = useCallback(() => {
    exportMeasurementsCSV(measurementList);
  }, [measurementList]);
  return {
    activeTool,
    startTool,
    cancelTool,
    measurements: measurementList,
    clearAll,
    remove,
    rename: rename2,
    exportCSV
  };
}

// src/hooks/use-display-actions.ts
init_viewer_provider();
function useDisplayActions() {
  const { loader, colorMode, setColorMode, pointBudget, setPointBudget, pointSize, setPointSize } = useViewer();
  const setQualityPreset = useCallback((preset) => {
    if (!loader) return;
    switch (preset) {
      case "performance":
        loader.setPointShape(0);
        loader.setPointSizeType(0);
        break;
      case "balanced":
        loader.setPointShape(1);
        loader.setPointSizeType(2);
        break;
      case "high":
        loader.setPointShape(2);
        loader.setPointSizeType(2);
        break;
    }
  }, [loader]);
  return {
    colorMode,
    setColorMode,
    pointBudget,
    setPointBudget,
    pointSize,
    setPointSize,
    setQualityPreset
  };
}

// src/hooks/use-export-actions.ts
init_viewer_provider();
init_dist();
function useExportActions() {
  const { exporter } = useViewer();
  const capture = useCallback(async (options) => {
    if (!exporter) return null;
    return exporter.capture(options);
  }, [exporter]);
  const download = useCallback((dataUrl, filename) => {
    ExportManager.download(dataUrl, filename);
  }, []);
  return { capture, download };
}

// src/hooks/use-visibility-actions.ts
init_viewer_provider();
function useVisibilityActions() {
  const { showMarkers, setShowMarkers, showMinimap, setShowMinimap } = useViewer();
  const toggleMarkers = useCallback(() => {
    setShowMarkers(!showMarkers);
  }, [showMarkers, setShowMarkers]);
  const toggleMinimap = useCallback(() => {
    setShowMinimap(!showMinimap);
  }, [showMinimap, setShowMinimap]);
  return {
    showMarkers,
    toggleMarkers,
    showMinimap,
    toggleMinimap
  };
}

// src/hooks/use-display-settings.ts
init_viewer_provider();
init_dist();
function useDisplaySettings() {
  const viewer = useViewer();
  const [localSettings, setLocalSettings] = useState(DISPLAY_PRESETS.standard);
  const settings = viewer.displaySettings ?? localSettings;
  const setSettings = viewer.setDisplaySettings ?? setLocalSettings;
  const applyPreset = useCallback((preset) => {
    setSettings({ ...DISPLAY_PRESETS[preset] });
  }, [setSettings]);
  const updateSetting = useCallback((key, value) => {
    setSettings({ ...settings, preset: "standard", [key]: value });
  }, [settings, setSettings]);
  return {
    settings,
    presets: DISPLAY_PRESETS,
    applyPreset,
    updateSetting
  };
}

// src/index.ts
init_utils();
init_locale_context();
init_en();

// src/i18n/types.ts
function createLocale(base, overrides) {
  return deepMerge(base, overrides);
}
function deepMerge(base, overrides) {
  if (typeof base !== "object" || base === null) return overrides ?? base;
  const result = { ...base };
  for (const key of Object.keys(overrides)) {
    const val = overrides[key];
    result[key] = val !== void 0 && typeof val === "object" && !Array.isArray(val) ? deepMerge(result[key], val) : val;
  }
  return result;
}

// src/i18n/de.ts
init_en();
var de = createLocale(en, {
  toolbar: {
    viewTop: "Draufsicht",
    viewTopLabel: "O",
    viewFront: "Vorderansicht",
    viewFrontLabel: "Vd",
    viewBack: "R\xFCckansicht",
    viewBackLabel: "Rk",
    viewLeft: "Linke Ansicht",
    viewLeftLabel: "L",
    viewRight: "Rechte Ansicht",
    viewRightLabel: "R",
    viewBottom: "Unteransicht",
    viewBottomLabel: "U",
    budget: "Budget",
    pointBudgetTitle: (m) => `Punktbudget: ${m.toFixed(1)}M`,
    size: "Gr\xF6\xDFe",
    pointSizeTitle: (s) => `Punktgr\xF6\xDFe: ${s.toFixed(1)}`,
    panoramas: "Panoramen",
    togglePanoramas: "Panorama-Marker umschalten",
    minimap: "Minikarte",
    toggleMinimap: "Minikarte umschalten",
    clouds: "Wolken",
    cloudSelector: "Punktwolkenauswahl",
    theme: "Design",
    switchToLight: "Zu hell wechseln",
    switchToDark: "Zu dunkel wechseln",
    about: "Info",
    sidebar: "Seitenleiste",
    toggleSidebar: "Seitenleiste umschalten",
    colorMode: "Farbmodus",
    colorRgb: "RGB",
    colorElevation: "H\xF6he",
    colorIntensity: "Intensit\xE4t",
    colorIntensityGradient: "Intensit\xE4tsgradient",
    colorClassification: "Klassifikation",
    colorReturnNumber: "R\xFCcklaufnummer",
    colorSource: "Quelle",
    quality: "Qualit\xE4t",
    qualityPerformance: "Leistung",
    qualityBalanced: "Ausgewogen",
    qualityHigh: "Hohe Qualit\xE4t",
    navOrbit: "Orbit",
    navFree: "Frei",
    navPan: "Verschieben",
    navOrbitTitle: "Orbit \u2014 CAD-Drehscheibe, um Ziel rotieren",
    navFreeTitle: "Frei drehen \u2014 Blender-Stil, keine Horizontbindung",
    navPanTitle: "Verschieben / Karte \u2014 linke Maustaste verschiebt, Horizont fixiert",
    camPerspective: "Perspek.",
    camOrthographic: "Ortho",
    camPerspectiveTitle: "Perspektivische Kamera",
    camOrthographicTitle: "Orthografische Kamera"
  },
  exportPanel: {
    exportImageTitle: "Orthografisches Bild exportieren",
    title: "Bild exportieren",
    view: "Ansicht",
    viewTop: "Oben (Plan)",
    viewFront: "Vorne",
    viewSide: "Seite",
    viewBack: "Hinten",
    scale: "Ma\xDFstab",
    background: "Hintergrund",
    bgWhite: "wei\xDF",
    bgBlack: "schwarz",
    bgTransparent: "\u03B1",
    format: "Format",
    exporting: "Exportiere\u2026",
    download: "Herunterladen"
  },
  toolRail: {
    measureGroup: "M",
    sectionGroup: "S",
    measurePoint: "Punktkoordinate",
    measureDistance: "Abstand",
    measureHeight: "H\xF6henunterschied",
    measureArea: "Fl\xE4che",
    measureVolume: "Volumen",
    measureAngle: "Winkel",
    measureProfile: "Profil",
    clearMeasurements: "Alle Messungen l\xF6schen",
    drawClipBox: "Ausschnittrahmen ziehen (im Viewport)",
    clipModeKeepInside: "Modus: innen behalten (zum Umkehren klicken)",
    clipModeKeepOutside: "Modus: au\xDFen behalten (zum Umkehren klicken)",
    removeClipBox: "Ausschnittrahmen entfernen"
  },
  sidebar: {
    tabLayers: "Ebenen",
    tabPanoramas: "Panoramen",
    tabScene: "Szene",
    tabMeasurements: "Messungen",
    tabClassification: "Klassifikation",
    tabScenes: "Szenen"
  },
  scenePanel: {
    pointClouds: "Punktwolken",
    noCloudLoaded: "Keine Wolke geladen",
    measurements: "Messungen",
    clearAll: "Alle l\xF6schen",
    none: "Keine",
    sections: "Schnitte",
    sectionHint: "Werkzeuge nutzen um Schnittvolumen hinzuzuf\xFCgen",
    clipModeNote: "Schnittmodus gilt f\xFCr alle Boxen"
  },
  panoPanel: {
    searchPlaceholder: "Panoramen suchen\u2026",
    noResults: "Keine Panoramen gefunden",
    flyTo: "Dorthin fliegen"
  },
  classificationPanel: {
    title: "LAS-Klassen",
    all: "Alle",
    none: "Keine",
    classLabels: {
      0: "Nie klassifiziert",
      1: "Unklassifiziert",
      2: "Boden",
      3: "Niedrige Vegetation",
      4: "Mittlere Vegetation",
      5: "Hohe Vegetation",
      6: "Geb\xE4ude",
      7: "Tiefpunkt (Rauschen)",
      9: "Wasser",
      17: "Br\xFCckenbelag",
      18: "Starkes Rauschen"
    }
  },
  measurementsPanel: {
    noMeasurements: "Noch keine Messungen.",
    useMeasureToolHint: "Werkzeuge nutzen um zu messen.",
    measurementCount: (n) => `${n} Messung${n === 1 ? "" : "en"}`,
    downloadCsv: "CSV herunterladen",
    csv: "CSV",
    clearAll: "Alle l\xF6schen",
    typePoint: "Punkt",
    typeDistance: "Abstand",
    typeHeight: "H\xF6he",
    typeArea: "Fl\xE4che",
    typeVolume: "Volumen",
    typeAngle: "Winkel",
    typeProfile: "Profil"
  },
  viewport: {
    overview: "\xDCBERSICHT",
    hintPoint: "Klicken um Punkt zu setzen \u2022 Esc zum Abbrechen",
    hintDistance: "2 Punkte klicken \u2022 Rechtsklick zum Beenden",
    hintHeight: "Start- dann Endpunkt klicken",
    hintArea: "Polygonpunkte klicken \u2022 Rechtsklick zum Schlie\xDFen",
    hintAngle: "3 Punkte klicken (Mittelpunkt ist der Scheitelpunkt)",
    hintSectionBox: "Ziehen um Ausschnittrahmen zu definieren",
    initialisingRenderer: "Renderer wird initialisiert\u2026",
    statusPts: (m) => `${m.toFixed(1)}M Pkt.`,
    statusBudget: (m) => `Budget: ${m.toFixed(1)}M`,
    statusFps: (fps) => `${fps} fps`
  },
  renderingSettings: {
    title: "Rendereinstellungen",
    rgbSection: "RGB-Anpassungen",
    intensitySection: "Intensit\xE4ts-Anpassungen",
    elevationSection: "H\xF6henbereich",
    generalSection: "Allgemein",
    gamma: "Gamma",
    brightness: "Helligkeit",
    contrast: "Kontrast",
    range: "Bereich",
    elevMin: "Min Z",
    elevMax: "Max Z",
    opacity: "Deckkraft",
    reset: "Standardwerte wiederherstellen"
  },
  scenesPanel: {
    saveScene: "Aktuelle Ansicht speichern",
    namePlaceholder: "Szenenname\u2026",
    save: "Speichern",
    savedScenes: "Gespeicherte Szenen",
    noScenes: "Noch keine gespeicherten Szenen.",
    restore: "Szene wiederherstellen",
    exportJson: "Szenen als JSON exportieren",
    importJson: "Szenen aus JSON importieren"
  },
  displaySettings: {
    title: "Anzeigeeinstellungen",
    presetsTab: "Voreinstellungen",
    advancedTab: "Erweitert",
    preset_compact: "Kompakt",
    preset_compact_desc: "Kleine Beschriftungen & Marker",
    preset_standard: "Standard",
    preset_standard_desc: "Standardgr\xF6\xDFen",
    preset_prominent: "Auff\xE4llig",
    preset_prominent_desc: "Gro\xDFe Beschriftungen & Marker",
    measurementsSection: "Messungen",
    lineWidth: "Linienbreite",
    labelScale: "Beschriftungsgr\xF6\xDFe",
    sphereRadius: "Punktgr\xF6\xDFe",
    markersSection: "Panorama-Marker",
    markerScale: "Pin-Gr\xF6\xDFe",
    markerOpacity: "Pin-Deckkraft",
    markerLabelScale: "Beschriftungsgr\xF6\xDFe"
  },
  about: {
    title: "Info",
    productName: "PanoCloud Viewer",
    description: "Ein modularer Punktwolken- und Panorama-Viewer, erstellt mit Next.js 15, potree-core, Three.js und shadcn/ui.",
    engineLabel: "Engine: potree-core + Three.js",
    panoramasLabel: "Panoramen: Pannellum 2.5.6",
    uiLabel: "UI: shadcn/ui + Tailwind CSS"
  },
  panoViewer: {
    close: "Panorama schlie\xDFen"
  },
  uiModes: {
    professional: "Professionell",
    lite: "Lite",
    modeLabel: "Modus"
  },
  clipToolbar: {
    title: "Schnitte",
    addBox: "Box hinzuf\xFCgen",
    clearAll: "Alle entfernen",
    keepInside: "Innen behalten (alle)",
    keepOutside: "Au\xDFen behalten (alle)",
    show: "Anzeigen",
    hide: "Ausblenden",
    delete: "L\xF6schen",
    move: "Verschieben",
    scale: "Skalieren",
    rotateZ: "Drehen"
  }
});

export { AboutDialog, AxisWidget, Button, CameraAnimator, ClassificationPanel, ClipManager, ClipToolbar, CollapsibleSidebar, ComponentsProvider, DISPLAY_PRESETS, DataProvider, Dialog, DialogClose, DialogContent, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, DisplayControls, DisplaySettingsDialog, ElectronSourceAdapter, ExportManager, ExportTools, FloatingPalette, LocaleProvider, MainToolbar, MarkerManager, MeasureTools, MeasurementManager, MeasurementsPanel, MinimalLayout, MinimapRenderer, PCV_BUILD, PCV_VERSION, PCV_VERSION_STRING, PanoCloudViewer, PanoPanel, PanoViewer, PointCloudLoader, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, PresentationManager, RenderingSettings, S3SourceAdapter, SceneManager, ScenePanel, ScenesPanel, SectionTools, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, Sidebar, Slider2 as Slider, Tabs, TabsContent, TabsList, TabsTrigger, ThemeProvider, TileBasemapManager, Toggle, ToolRail, ToolbarIconBtn, ToolbarSection, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, ViewControls, ViewerProvider, Viewport, WorkspaceLayout, WorkstationLayout, buttonVariants, captureScene, cn, createAdapter, createLocale, de, defaultComponents, en, exportMeasurementsCSV, formatAngle, formatArea, formatCoord, formatLength, formatVolume, toggleVariants, useClipActions, useComponents, useData, useDisplayActions, useDisplaySettings, useDraggable, useExportActions, useLocale, useMeasurementActions, useNavigationActions, usePcvRoot, useTheme, useViewer, useVisibilityActions };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map