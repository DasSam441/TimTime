(async () => {
  'use strict';

  const BUILD = 'v17.5';

  // --------------------- Storage ---------------------
  const LS_KEY = 'zeitnahme2_state_v3';
  const LS_UI  = 'zeitnahme2_ui_v3';
  const AUDIO_ASSET_DB_NAME = 'zeitnahme2_audio_assets_v1';
  const AUDIO_ASSET_STORE = 'assets';
  const APP_DATA_DB_VERSION = 2;
  const APP_DATA_DB_NAME = 'zeitnahme2_app_data_v1';
  const APP_DATA_AVATAR_STORE = 'driverAvatars';
  const APP_DATA_SESSION_LAPS_STORE = 'sessionLaps';
  const APP_DATA_IDLE_LAPS_STORE = 'idleLaps';
  const APP_DATA_STATE_CHUNK_STORE = 'stateChunks';
  const APP_DATA_DISCORD_QUEUE_STORE = 'discordQueue';
  const PRES_SNAPSHOT_KEY = 'ZN_PRES_SNAPSHOT';
  const BUILTIN_DEFAULT_SOUND_ID = 'audio_builtin_defaultsound_v1';
  const BUILTIN_DEFAULT_SOUND_NAME = 'Standard Bing';
  const BUILTIN_DEFAULT_SOUND_DATA_URL = "data:audio/mpeg;base64,//vUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU2mpzJ4mNPO44tGDdyaMLGs2fBzibzNVkkwGUzMpjMwmEzCVzH4TMBDYy0bDNRUDCobWR6VG0cGCJ3mSma65pmhA7ATDRNuM42xpcxHjw2PSYWcMJQ3HDcYNARBk16z59PV0RjHn2ebokEZSxvPG0kCjHlWHLuFlC0CsC+wCOZZoGTX0ZJYKPa0WoAQCCjyPu77kM4Zw/EfXOmOuuNLvZfadhyHclk2/7DFhF0RlDMwyTNNBx6DBqrmiKuoCDGUYZQwKAaAreWYV4nuWnTXUMMAQDENZMAQBEKwPWieWzLbo/ydrcXiDuSlc6EtMOGkh2DwQziQMDQlp1t0AIJa9v2AF/C5CDjBJKqRllK/8++iwjLINSEVxLXba+/dvcrchhixHEeMuuYIJb9uwBBLpv8pgoJAj7tfpmtsTa/F4gsIkIppLWcQJAbX55gCEhOh8S5CVkRWHUHdeOQ5Qs4cSzDbW2duXPxBncDvoziBIDUDUHgeVy/MQQQggRgQAAAALB0NESY81AcTMuZsIcZCNmYihOYbhmYNLIZBA6YwN2YjDmCguMHAGMvyGMjTzMEUzNPgNMRA5Yp42omtqcZIOJm4NsnLvsGO0MQ5YcDD6qObh0xiGjAIxSsL+JohzcHTgaCI4iEgwsQw6gYPmGQCsA8jSDEp8NFlQw0UjPAkMEi//vUZP+AC6x2poVzIAAAAA0goAABN7YdATneAAAAADSDAAAAIRiYgBJg4CmNAwFRC7q10k4Ys1AILQANDHRiCgTeIxCFQwFGAw0YHBIiAAECYUGEpft15RyEOGYPC5YAgQDmtp8AYBhgIBIGHiUi0Dhgh3IgSrTA614Aij8XuxhB4MEQBApgUCg0DrfWoDQA8pEGH6DgIqYSAIkGQuApS/cbt9xjfbdwFBVMJIhnocB0BAsGAEI01kUHSGACYDBZg0BmBQYDhc4I0DwEEhoA2IxRU+V63hNxd37U4gnAwDAIJZ0kGpWuSGxCB0KhYBkgAXqGBwwQAKUSAJCC0fmIhcAIzvuIQOrc0/GtLKSxyx+Egp+295////////////gkDl1lcrlLN05fOGS25e1SpHxNxMyXf///////////pXSpON8ygBIVAgDCoCIgYl6DQYrYBhMmcjyqNkMzQw4gyzBSB/KDhjDKFDMdwWYxzBOjIgCmMFYGkw4hijDlAoMCgCkwCwXzAOB7JhNjDvAFMAQBYwcgOgLQLPAzodEGInG/Mp25AaTHG9E5tTaaIhGGBxXFGsNhmR+CQczMNFkIzRAMiZw5iBpWFCgxcIFCMwAEBAMkijgAi8BBhgAqZABAI7QvTDM2Fwg7MBCAg1TFMQDzKBkwQEEYELDowFpoKWF2gKBLClUYKEYwcERgQHmDg5g4AQjoyIDRkluXMfQtqrYDQVMhRwKABgIa/7AiEFMEDWxoPsXTxRyCwdLFIPGODCYSVgoAqXsmMHBVaC/he5LdTFKNh7AQKANRIAQkB0TiUAHRlMdQcRAg4BJGyVMJRUWASEPXIMhCHNB0t8jMj2zJ11uoTUBtIs1BVQUYB21T4TGSLYk1NfyQqZTQYMYiKhq7RkFVslaGid0EM7b5qL/Mod5R950W03U5y+jK0bUvWY2qBACkWwRMtUihocAK4WzAKQTQGUrJFgdwREAoXNRTllTKFVlYlpsAUiv1OxMaFF3kxEfETxgAVgUqiz/s//vUZNOP/X92v4d7YAAAAA0g4AABNWXbABXtgAAAADSCgAAEAHANHp4ZFAtGa/BVhgZBMCIMowZRTjERC6MKwNcwSAlRITgwywLTD/AUMGISoGgGGFACeYFYSxiYCEGD2D6YdAShg6ACHCuBoR4YkfEKuYWvnoMxvouFIE7Q0NYWTK2Q5s7NFWzajUzM/MYOjDU9T5jR+CnwM9TIxcGAQYQGWE5gKiZ2FpMGjDBi4iYYQmBDBhA6YwAAo4BoSZEGJQFvgE/FQVXqLCIGADDTcwEKEBOXecYSB0OBiQeIgIOASoKFZKYQCBQPDglKkRBYNESUBDAGIsNLciEATkYM7ZdSnXO2q8E4n/EAImK9imqqaQjRy04BAlY1KU6goCAEHEQKmoouvQYAxgAHQAgAQMBUTeBwAYcEKGMNgIs+6bpF2BQEHAp3GMryXEmMrhlQKBoqKAqmiJjEkBwsJtDZO6SzGcNo1pS91XrlDjLNVibPClmus+qCzntGYhJWvNRTSV3QiMDYHGl0tMdyQL5THSKRQTXbZu6pJKoZD8BjoKkesVgzLk/lMmTPA4bcJlxCYNZaqBCBRJOyAm4lp2fzZbhUqjawzXUw4aUNd5QAiC16K2rAxWakXfb3P1wORgOBwOBwOBwDrGyECh8luTFCVChqPDE8gEHKrwGHCUyDBaZwYMCCxlgynCkVrFtBYIjCkGlqJQtJY4yktuZWCkbJGgEAq1KGpZIjBcDx0GBQJDG4AzIseo1EZFKbBhUBRiEECE1JMoAgwiKsQCiZJBUYQgmYWCDAcuh6PRSMGA4IhwHmFYTmAIQGHwMGVQyGGAOGD4hAwICIazZN1T6eubsKi0Y+pVEYqmL4SmL4emAIIGDwCGDQNCwKmjgAmY5UGDY0GMoxGAJEmGoXGLgu1csMeavYAYFzAsCyIAi6ClCvHfzMNhyM3BaMJQiMIQ5MFQKMAAfMAgMR9zsa7d3q5yzbwhbKHUBQDqpF6E+KdKJBQwSAsxRBUwwBo1oKAx7DEoEl//vUZJQADX+HUG5roAAAAA0gwAAAMUnNO92vAAgAADSDgAAEG0wSAKrS548zp+52+8sVHElEUDgAVXXuoO4/VJpeNoYLgmVgaYOAgCQXMMQxMJAIBQDQQw5EYwDBoFAOYCAP/////////////////////+DgQTfSTTrppZhXtsvboyRXEpl////////////5gOFxlUIxMGQQEYcAycErm2MICQEIwkHKVKmrlK7kcIQAAAAAesSJIQhkYomJKQCTLvuFHRGJEpJfVYhatDgWmTGRuTRMAIAUSANbiv1oghAOMBUB4wHQITAzG2MgYJMwdgNTAAAAZIBQCHbZAtFsSMw0AUsEwMeABbVlrkp6oal2X0CoBRgfgqBAHxbYuMlS9kMTEWdpiUFI9Py0oCgDBAAwoAiYEwJJg5BAmFgQaZjwcJgHBAmiMWsYq4ahhIgiAkA9wDAGABS6ZWlSr1cqD0kb9kql1VjjrwKu6gTGL/GAOAgRAFhcAwwOwgjFHB1SwC4BhgDgAJXLCpesujsAtNf2zhVmrkul29cqzVHhDTwoCTAOAZMBgLsIBeAIAAhAsC4FRhOg7GAiA8YFIRwoAonfDYMAFDgBW7NbcWOstfW11aL9wzAKuWYyyzjACcpgDAOmB0ACtVcr84d/LKtazx5jVtTWVLnWdqN0DhIIjAZA0MF8Q0wNAJzASABa6w0wIwmwSAU06BoZlMOy3LLVrLX///VqsBQkhQEMaB5ZzFdflGrWEaLVCKEIABvMmUCYL5skpSlngkYw014GAgooACmzixSIgMRTAdRuxhgAJYueZAYNEGCDA7CsMXkGAwRXFDVyENMBkCILActQBoETFms6IAASyhgAgDJUMKFQCWzF+AaBKYAoCZQAKhOSSAAEJgwBLmCMAAYCIAwOACXAr5N9G4oAGVOmq9ibdJBa2xCAcYA4CIBAaMBgHUwtSSTXIF1MJ0wg7d5hzCND8MEgG0iAjMAQE8hBYoAwRgQAgUEIACoBFxmahQBUORbYAgEH//vUZGSA/P91ySM+7NAAAA0gAAABLuHNI237s0gAADSAAAAEACYBAC5T/UKMZhQAokJAGCIqg4YVpGar1cYbiGFQWT7UoLZOjAUcT6b16mdxTra9rRnOkscdmiepuSogMCpWA5pEYwRe5h8B4KBYwOEUykJ8xiBUztQU2ACUwLBlHxTNrDuI+tzLuxNwE51AUJKRQBAJnSg02yFgywthsMwCQpVw/L2RKmkeW+W47JqWI1IzWfanm39nH1btircYBg2YPdwYZgTZFAAMHQrNKGjNQAJTCZDOTdFKcfzxxuUtzOllMZksYWOYHH6Z5AesR34pct6vXKfHV/ZBCgYAhA4x3RCL/mQio8VGJCZhA8sGYkCqHmAAo8fx8YCxIFQXQ4p6reULWGcFTwYJLJMDUG4xdwVDCZdKMlgQ8wKwLjAAALLLEABIJAEUuUuh8wAgCTAKALVylUyJIcCgDKmhl9GOvuYAIAAVAhZ+oK2FzmBNPZi/seirTViy50E01iEgBZgHALGCaCSY6Q95mRBimAAOiaZ1nBgJhhgEF4dAHGQCAYBIVARg8PL7HADd4v001OaxBStr8vi+0AtMCoJhYB3SAwRGJwdn4ydgY6CgL0LF7OzFqW5GJ6jk9eSVq+ozzH8soapobSOAIAiIRDFG0jDkWEFwgBmMmDAZjgcmIlXmGQjjoIJMswc+23XOGYzMRa1AtpyXhlL7w65kHuzlRKGOnMP9Sd5znbmVzO7LZdTdt5ROhpKuTjmCQHGV21g4cGbqqg0MDIa2jGwWzCUCA4AV1P7TUtHvWd2xWzs438JfFGVmBBcmUgGt5nYqV9U3xCwRgsAgAgcyvhh8pSYybGSFQKCRGWEAOAmYQAQCPwaJIhBUEdhiYsGKRbdB9YpctYFNcEAZgZgGGK6DMYbLShlAh6mCuBIDgKS7Teu1G4YTyh5dDFmGr6Z6nw4sErWdd7Wsu+1eGHFeabbaBo7E+xp+aGA30lbqIBzAgAYMW0LcwyACTBYG+NHSt8w4gqDA//vUZEcC+tZ0SFt+7NIAAA0gAAABLRHTGy17s0gAADSAAAAEnAtAgCSlYWARPciAFprJGnQpyV7rxn3GjkzPODA0FGBICBwXAYBTAQGTBs/DiVMzD8HAUAqYzkw9VuWe01LVvapeXtUuVb/q0sja41saCkOicDRwHBWh4jsHAqYEgKZvH+afgmRCItVXD0v/CaWitzsxMxG7qNW5bhLrEvrzDp37V7nLVjWVnVNj9nuPcK0YiEbyk7NDA0ATT/HgEN4GAAwDAUwYDA07Zo0/AxS2SQDaxy3nhnq93e6XPLkkfcwCHcBGC6lecuZ/leu8mBDACAA9eY0KQCzXMxEUEBcAASoXMkMMkEHl4OoCIcOpyseLSwcAEhKhJlQqEK8dl/BRqYEIMJixg9GLSxcbsIfphTgcGBMAmYC4ACcoXAML4N46r0qpOU8dVsaKkJlMTjDOF1RmumbII/VikolzW3wiVaicV0VVBCACYAQDBgTgumNsJUYcgAZheiennvfwYvIQ5giAQGAyAKCgBDAcAy7Bft44eeJyZyDWWvwzmXOQ/UXUcWORA4BggakKAoYZmeccv4YWhGWQUDdRrcCzFqM16Wlh3K9O5XJfcsUGEhpYadEdBIQiiYkZyY0CqKAYiWsgYBEwHFgySvw0/FIBAKLBM78RpJVUf6mmp+/+WdFK5VnQ4U3a7jS6jw3ja13VNhaw3rCrjXyYHXpIzEVrhwQHGHdgohC9aPAgEkyX5cyrHgw0BMFAMwVp0Oz0zS2rGX1eVI3l9LKIfBAug4mX8v0ti9cytW5zJipQAAQAe4HpocAlpFhR0LGLxuGFswCNDAAWEAAGhmDg6YCC5aIwqAyEDGCgglC3NVRVJfhgUDgkMBYQjIGeYD2A1GC2gwBlGoC6YFeAJGAdAB4QARAQADFgApvV0CQAI+zKFXvfSLUZNBjS2oJX08HtdoWJ160nbys1h5qGQK2vMvNpCd6xBUATMAIAXjBCQh0wGwBLMDUAZDRbiE0wb4A4AwGeRAIA//vUZFMH+5d1xjOf7NAAAA0gAAABLX3TFq3/s0gAADSAAAAEsALiwMEwLssWEid6HHli7nM7fhw4HmX2lDIiACzAQAS4RgGAxiASZ50LYYWosCyrXOnOxXOIdi83X1R3pqeqy2R0j/xq/DC61qBAZmlBVmqoHgYPGDhwBjIFmDQSGetxGjAnGC4CloljtccShsSLCOVN0eFmnk05emqPHN9ZByZv9xz3b/OmvV68/lTUlWLrkmpTKJ5lgcDR0zswsNytoIAAwfD81+g018A1H6A4Emb1Phnya7u3G6e3qnyyzEAaiQq6n6LCthcuZWOXtIHuoJwLAYgJEyqSK46JGcKYGJDQBsiExYWDg4YBzEFkDI7LyYhjQXDC8AXGxGRCgGYGHAQvMAmA9TA2gCwwVkWzMttAlAcCnhADAWnCgAGJAESmjU3LVAosuh9Wst0VoZi1uVS2Q4QG+jhRF8G7l0I4+DIIHlbDG0zWFZAoeQAChAAzmAQBNhgIICoYHqBsGn+g7Rg7oBAYDcAChAC0HADIOCJLhNZqrVLrcqFikCxN4WdSh7n1pISBgGIgmQGgwERU4DN1RTA0FkbWFSuVR2/P5fN3Y/dq5SmUUlmGZVJrlM2NgQEAkRiQYPWsZXiIiahC4oJAIwmDE0hfE2yCseEZERmzqzlmXUEqiV+pWptXpDP6mqPOmwobNPIozMVuS3dHX5KZyhu53vwVXgG5Owy6xgUAZ3Fi48NqNSeoVDoyExoy8GcwtAwIAFNaHYtFaaP1eTs/YqV5Fcu4X7gwDIsFtJVrYYy+5ZrVuEoIAAEAgA9rQiYQiMPmYCUNFowwEg4JmVhWYrCgNBKDxg4LLIMREoWHTOBIDg0JgYDkQBBgQLclo0TTDodMBaA/RYPVMD/K0TKrQVQwI0AfMAgAAASAEAoALRKFAAIwAEABJQAlxS77KYekLxu0NAADCmssmfXlG0pisYaWuMaAAbcfgmwuFlzhRFcLgpvCIALMAJAUjA8gpUwKABxMD6BrTUiB//vUZFGG+/l1RUuf7NIAAA0gAAABKv3ZGG57s0AAADSAAAAE2QwcIB7MBrAIDAKAAsDADw8GJQAQ8AKgzcGfSVyKS1GG1gGxNuzRtzR8SEf9ehhKEpvmfBhaAZeh7nkm4dmJuLTM9KaG9Vmn8+CJqUX5DQzsfUwRrMGgMNEVkNHAgEg7FgASYFQGBInmRXdmJo0mAAFAYGZMueX7k/KSZpaXH+bmpbSajc3O3o5Yn4vOXYhlZlXLeGfbUvsWK9tLSJVaZnTNTAcCjxWxhoaxoAAKAZg4Ghpq/gZOzixSvZp6XGmlm56PV8pTSw5avUtIQAeTAbO8xlsmwwl1y5epSkAAPNGQaLACJgJCIYIQCUTJRRAIXCDKTAUHDFSAUAIqByoBTAoDSEb9aK1h0Al4GchQDAEEmCIDGY6wD5gp0SmpeJMYF4EZIA4HABhABiHFMwRgCr2aKrbI2os5dOHWdvs05VZ4ph4INb6LRJq7qP5HKspjj8uXTKMR51UAxgEANmJWMsYPYJxhHjCHmPIeYeINxgYANmAeAQXJMDwGAQAl+lK3fciJLCsMlqnTdUulSU6uX9eJTFdLjJjGAgjmlgeBgQs6dWeoLecvnauNzG1hMZXK9uxWl1PJrbwpzBQITD1qzIgG01nncYWAEHBMUOYPUOHBIpu4j77qYY01mtO4W+5T337cTxzvUNipas2901zte9WpaeM8ld3Ko3OW7xh19izpxUzo0FLnygUA0xRZMyFDAHA6up+ZFS26X6ucskk3bv8s2Mss07VabON65R8vfNXpVUvcBGAAAMAN6jNZKQ+MlORdMc3NY9PIVWGFVRlF5gwoUBmqoAI2ZUOASgOLuKTDQUYNARToGiI0VIgrTKaBHMDjgUxDxigICSCQHjAGAHBQCRbtIxYEWAmTVbA/bWSoAArt4VStLX8vlxWTM6Xk8rVIkvpp1qGXbkdd4mWPA9sJcsoAAMB8AYx1hgTCsBXMHog87hN9jCuClMCUDAwAgDwaAAYGASwARgWu//vUZFQC+0t1RUte7NIAAA0gAAABLpXVFU77s0gAADSAAAAEt3WqJOs5apOLHbE4y4VWNOklVoS43FUVEQtGFheqUPvEHZeTKQS14oClD9wqMyuQ26SUyHcFRyejcmfVKwwFAszKSsynBMrARKNIpCSBQ8MBLqMpxMQkiQBM/j1TLG3KYxZkMtu0Mp+llE7WmrE5PUVqXRy1vO7TUFNlW3GJVEM6tZYKGndl0PM5BIEHTbGBAbMBTIMAQfMmmNCFYh186WmuSqbjNPKJfK9RSaoZ2O24dkq83lpKWWUNam1uxLaO4yIGCGAAOZ1KM8ghAgpGOYJmGQcGFoQGO4eGJYjGMYLmGYRBQBTDsDGHGGISBAMp0hYHmUKdl+y9YIAMMCpyUxjBCCWMoAFkwoNdzU6FYME4FMwFQCm8CoDgXAVAgBCm5gBgEsDVWeV1IgvuPtcY8oU5C9oPfVyJYyZKq3G3Lija247CHca4hq/b6I1mA8AAY8YYRhHgdGBKPEaxvPIjCaFALxGAcgyYUhICAhBASBAICEAwCAdkgAJKMwDB0u0jEHAyl8WUHgGMBgEiD4QA8LahgDGfInDQLtYk8CxW1CIFj0bhnCtGMJdL41GaKLUMXqTEOrKbCIwcMKluMeQSTplEZU5MEAAM11mNDgaCAXUeb6KP5A0ot9inZqns5TGc/O368h7c1Ys5XI3qTV5+Z3S15Rfp5ZQRqwwmtGqshYcDANOUkJGglgZ5S5RjUexksEIOAptX2opJO3LVeb3crTk9bsyeenbjourUimWpZJ61PWv0uEIEAAYAdLE6Z2ByYJgGYLikYFCeDAsMIC2LAYg4wZRYY1GbMUZI6YyoNDQh6DsrskQowANrAlJTLRlQ6GBoHwZUAKpiKbInMYIsYPgJYGAeGAB1rDICJAAQNAHhgBwsAOuqLpKruRVQ4vqhiqx4HtQOUCghlzauO9MHqjfNm8sjr0u8ks7sHI/lpDAhAhMgABgwfAHzAXG7MwH5QwmQkzAQAiEYB6iR//vUZFMH+5V0xLO68dIAAA0gAAABLRHZEg57k0AAADSAAAAEAAWjYKgArBJeLQYXF4QoMKgBUEGtkYDD8OSx0WW3FpBQDUwngOEcc9Pu5ENw9G6j5yyT3LU2/j/Yy93IEbXUWfyCYw5ZdgwkQxDBkACTzSxS5SKMAQCEwdx6TEGArBwByONe9fl9NbyfyWy+jeLlXOUVXAlkVisrlU3rCtC5TEMIDltrKV0tLFr8YlVKyJ54ctv8xELgJGSaFYJAPQIysEAMGCCL8YK4BqSUpi87lLaeITcek8/nq3yrEctT76y12KKFy+N1c78BRGedObKqZnwDGJREYvLpgkTAQnmZx4YHOBi4nGRwWLJsqBwcD5hUpmEwMYyGKaphkJhQDkAsX8BQcnCQCIAgQLCNGQIBaYmlbp2sA9GEYA6YFYDg0AgEARlYAAGAIXyX1ZCXjpCYBdXrS0QWtu7FlbW7PNG2usQljXETWPxeNSONQhjj1MMZw2dLwGgAmAMBgY2YaIQEUYKwmhwUbEmHsDIYF4C5gFABF2xAGhGAVyMgSrgpqC8X1EQIfVDushZkPuu0qUv1Ab4yUQA4xwT1hIo8kDyZucPuQ8cilEVltE/9yV0EeiluDrMroZiHVtDAFMAu0yYBVYpbAa0AqGzPXVM1ilChXLuSeR0sXjUWgucjcnmZfRyCZlHccIa3TV7dTc5SPrEIYmqaHrOMqvTmdFHGfyieuwy8QoET9Q7CADBDW1cGdSmaPCBfFwonlDtmdq23+xi+6bGjf+/q5m3d+Kl7Gft5xjVNO4TlTlUEDyUHDKoLjAoIDAIIDBIIjAoQjJA2zD4JTFQISQFzEMAyYOGuGBBUBgGhAUkAGBALL/TPQ4DQfiwZmBYGhQLjAVE6MZ4FcxVItT1EAxGhODBBANBgBwkAkOAIgYAoRgAtZgJHFCWl6XqQlEQAIVAPRyZG2VLVcKW7F5t43CeB+SYANMhdCuX2b5ij2NjU0VVEABRgEghmL0LMYAgBBhFhcniHh4Yp//vUZFMM+5t0xAu+5NYAAA0gAAABLN3ZEE57k0AAADSAAAAEIHYKCADAH0zAEFy6iWReeUMxX4zGWufA6grEqSjaS1992tRiCoQpcZ9CCV8CxeTXok88bdqPTGFJHJRGZe8MsjsBwx1nUtkb/YL3MqGsFGNVjXmdSYwSBjTSmN+gIiCLQ3chb2Q1E6J55134YbHHqGOxnc1IbVW7nDXJTLpZSwHE4zFJbSTld8ndtRuDIvJ2iRavUgpkJUCR8sAl8lytKEIPMGWMw4FkBsWweilnotBXYdgPGFx1wXqkL7xSmm52XxCm5SSWLTE118L4NMgGAH6JqYXHphMFAQ3lgelEqMHHcz4IQoEDF43AgLMBhUmAZVOIACZhEMlUEMYGAAYDBwFBxgULmDg+YIApgsQCATQDCWmIsk2eFQZY0JSYEIAAgAFCACUfjAHAKRZUARoZyl8stqRbNGxtWHBwA6Z7hsCZQzJcDqvcsVL1vFg1Y4m8T8vs2rZFRplEAA4MBCMPUZMwFAJwgSk9VokwMUQLBFjQEI8AcXxBwLRkdpHN04uXTKAFPo+w40pCRLXbk9SJQdfnyUCmJgQ4LIHUqtMkMsYdDkBOxNy6gorWUjlk5Cph2Y3LYfbE0lAgFkYEEZQGBrLVRQNGE9YYjEC+WHROL6gunfeMUkrgybp3geqfrSmdpsZbMXZdUuvZRReCoYsXq9jOE2qWpOVodbnLJ+nwfQsAc7cNF2vdDCJ5mwFmgACr6o72r0rkNLjWq0D708vjNazIpdTRG09lDIcZNHI325LYzTWclUAAACEAHFHWHOoZEJg0TKBmExwZhPAGYIkWQQPwcJUvgoAxgzAIngYAgYFgACoJTAIBGACkkYIBBbIGhwwKwiDAxAQMHYDo2ogwzA2AIJgLktiUAF9hIA930xRoAZtpfLFnP4uaQtyjKjLWHvYvFGzMbb1uzgv+ytr0A0z80Ubam7ETTKHAFzA8EGMBsBYwWwXjjDMeML8AIFAglAAy9QEJAYESDfNy//vUZFOA+jV2Rbue3NAAAA0gAAABKHnXGU77dsAAADSAAAAEGcZQIsGxFvoQvmdRQTsUYi+TtxB5WAGJBMohUmgmpEpc2j9XIZlL7S6OTVLu5RSy/9PGYxKbUoMLEBYAnn9+Fs0NFQA68X/LIfnYzbu0169e5XxnZXG8aXdJzOvjfvUUa5uYvzMvxmKfLdnm8MYKp+363U7juy1/pmLp+EFYk+60O252m/ON2sdTdWWTterLvxz5U52lq1Jmzn9DLJq9gIWCCAAyABsKVxieDRgQEBhMLoVCkw+BUxPJIaBUaF4QAWYEAeNBMNAKYCgIWomEhAgL0Azd2CsEHAiHgmb4w1Dwx9Aww4j4/aK0wKBIQhCKAQDgCSATSEgHU0bC6DesmcRq7kuU7ToNs6z1xqMU0rfxsbpzMopH5m7EPTMAQHHm4joBBgCBnmA8AeYHgP49tgYQACoKAiStacY8DpXo+I2EoCoGRB6LQwBq3F8hYTTOQ4OOmE48MvxKZC5KIQkfxx2aJ4JRB79NVfmRTMjkteaxvdiUxjep4tK36jOUZKoyvXCcvPsoaYHHgpVlz22bdJO0+pZfvZU1SepavLdbm+1J67LIrTZVOX7trHlilzrVNVOVeYZ/eYWb0TQ/EKrWDJRYSVozTZU9HYvbqyuYpKtJjN1r8eu455UVP2vYvdo7eHamCgBgAQAFZAAfwHTzMjDOkRhIaYUb4wNEAFECqQ05scDLqQAiQAy5VDZXQgBovEx58wQIKo16jAbAKMI0AwRFXGJUEyrIjejkJAMmAGAARADGASASz56VytMmofgWLwfALbPpHGm0lG/Edj2nLdSPQJTyuDuQ4+UEWGdF/TAzCMMBsAgwIQdjTrHXMEkBQHAEsSdkINKWqBtPaBEWgKoLMCoBkLjtaSRg5RRy2JaiLbxtPULgm733+j7VXedGHnqeOU00f3N9k1BN0EWnY5vONv1TydClg8puVrDhmSlhytyJvH72WWG6uFNq3LO4T9fkzhfxr2q+s9cu//vUZHwC+XRyxtNe1NIAAA0gAAABIj3LH033M0gAADSAAAAE2u3rNefkncK+clv0FvtflV4jnnaDemyjNVYaHbtTtfG3Z3y5Ur7vz1TL5dawtym3ftY7rk44gsawOyAegbGfjgCUQE5g6LQhGCQwMcMjAhEDGKjqY4NFC/5fgAhxcFgEbjRb0cAHFQOR8AoGgYvjAuHjUEX0MmxFUGkDIAQ+STVvf9h9LKpFDcNK2NPearI4/Foz9LYiHzMajcpu5xegg2O/KXeMMhJBQKmAwpnY0CGCgFrqdGNMoBzyrEQ36Y8yUt83cwwENUqVfoYqTcpYLkWl7nU7hFvX8gWN3oHjN9/oBf6U5427lfOxnyc3MW7VzU35YCgatTWY7DQEaImr1NU7upj+OreF/Kas5Z41fs8/LHPf6x5e/mFm5fr95hc5f3vWPx85DMaWxDZgEkRNNXrZWvyzqYYYUnbtfmV65/K2FrPn7pzgUXVMQU1FMy4xMDBVDAQAKUAcFYBMIgsCx4lBgSMYhkzYBB4gEfDXciuWGgy6CQEDFHnvb8rdTETiYaim1+GTAcQTGsHDCmZjykXy1w4BqP6aCxAEAbTnS6ldFmSQPBac9BGV3RC/QZvO20Oy2DIegztNamLknhqZcbOJNRMUw+AQPAEZDke+TAEEmEvtDoXAZBCvxEygWCXaWUT2Z8qugHT4VQZQgFVDK6DO7S0rN5XTxx/Z+GpjGJ14xMT0ZuR9zu08KjTpRDsKhibqNlaEuDfxeOpGA0PmsV41z85fnnuipq3NVc61rCzytXmqlzCrl+P6+/nfodT9/t7+/exr384gYRgvUtV4MEQYLpkV6/d/fx3OzlcuW69zG9ewq58oce6vYUl7Knv1MAQAwA4W0OaLwSWARqEZSa0BGLy5hx2ZyNFtzDwYBGRjyIY+3OuXsDGwmFEwVcsNWHAwsjYY4HiIMEwdQDDB9LmNrMGUWCDZSYBoC4AAJZ4CQBC4RaZDUGgHMDT8fiJJeLdcFFZPBp6qbutG//vUZMSE+PB1xruY6bAAAA0gAAABKPnXEs37M0gAADSAAAAEgxGxiC6Jxs7EXUkjswC2XZEAPKI2qgsOYTgFoKBFLATJjBKBGAOBWiA+9RAGkMguviBUwlIKcuCgnHAV2to0GmRmQ7SiclEZcCXQ8+rd5t35qAaWBZymir+u7DMTkUZgC7cnnnh2Gpe+77RSdIA6eNRmkrOSCpydGB49EYpuV0EXp4IgGW6ld+Gs6apSwW+knnLtBuJOjG4z2KzeqeR25ylhqvHLcPRugkUVxnHDPrCT0UrgA0bB6qUWqGUS+KapcNQ7eiMukL8yDOJXrdM/VqrhKIVSV5dWlF6mpZFMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVADAD8AZM9AkxGPDQANMwjwyInzQwbNRBozYYltFxwCDCYlGBS+YDIhf4x2Q0NhInmEAaVR0FAeKAwkBIOEpgHCAkQW5hKjAHKaAWLBJGAwAwOgKBUBUaAKMCsCUwEgGA4AtWoDAADQDigMFJroMl7i4aVCPzMn5oWYLmULdKcYI0FMIeAESGb1p0qTRVfBTZFroqGF2AKGAdGAIEoY1S9ZgfAVAEAdlDX1gyUCHGFtDQSGS/ytruCyFKxjaXqwztuVGKtK7sP1Hxb12IPldeB6CnfeC4cht1qHc/bibkS+PUjTqJyc39lzLKdYB75HBzi06DIptCCM8yls7+v9Wlzvw9C4bpoDjkGxzCbjcnwduk7GXEdnsMxSil9d+pZBVB2X2LmoTJ47Lb0Rgagct2jcu6jl3IdMHVCCzOcZVLJZA0FzMRi8ZnYafr41KKCG6CWZR6VwHKGlwBlC35i96/SlQUABQgDj4wBTZMelcyCajBwEMEHo02fTDowASHMBhMxERzFIjIhAYEG5j0WGDQCYYFi/k8jAAwMHBUtUKBUwCFgUIzAYD3CAVDBdFzN8cDIwNwCRoD1G9NIkAgBgCBZJ3UjjADAPFgBWxIIyYA1PFXkTYbPI1rNcNkDwW31XorA6NH//vUZPGE+wZ1Q5Oe1NIAAA0gAAABK83XEO57M0AAADSAAAAEC3Vh9orZFY0zWlKCwAMADmD0CAxAwGwSTMFRKMEsAcvwx6PA0QSgGolrF/EK1O073OC4ReEFEjo64HgkhigSGGr74QzB8XmaGExGGX/wXPGrsoj0WmYvYg1/24MvbZpDvQww+Fp6xVnLRlgGPN0bdjyTZkJkz0cnpfRLLppmQ1IlLpiMwubgeLynOcn6sqr3JiJ2Z6NQJhEYdmJ6VQxeh+pIqG1RNdh+CYzdnIUbVGrMYbKY1pQpyV3cZTEX+3WqSCjhVmA4ChMbifZE+0DQ3C7cfgOUy2BaanxnKipMQU1FMy4xMDCqqqqqqqoMAAAABAwD+d8DyohBjTERM8z9QNTcTRyMwREJBAxcvFBsLlgcVmHgREsGKEZKAmGhoOQjEigFMxhpaxUx4NMA4LMwWAFTAvL9NscJAQgKkwDJa4IBJMAEBYwDwDTANAAFgAG4jwEyf5KABFk5k3yzScMZbVpDlO0W5ZYuNmStsFscglPNnTUa6mKfxemBWiNSS2ME8GFr5gKAHGd4ZmHBQIHwRGkBgYuYxSSSb6wQXEEQRa1E0KBrJpLZd1TNDd83djO7kZch92vQy2tPTvjG2+fuBYnGHeTTQE32PpXrAqHL3TPgVmaGBdt/0JCabAFY2lrJLKLADkw0dOO4/MJdu6/ssjsxi41Bg8dJZxoZXnLo1GJt+rNSMwBNUcQp6LciilJeqRWih+US2MQ1DMNULrGa7CJJWjAIiFgY9KaWWyqGfsz3yK9LIJl9Fygn5dGo3D+HHdi828Fi9Kn5tx2e7A+N7zGRVCxKGkGYoPRlmGGAjma3LRms2mRyAYTFIYOzCBsMXCExEODFgZMdhYADQQAsRgsuKYEDbIDGJZMMEMwYAsTEAAZFE9zbdDMMBMANPQwFABCIAMwBQICAAcWBDMBAAEoAICAUXYMAEBQYAFLmmA6AWXZadioAnKt5G1aBZt9Efk2BQAFaqqKxGKLx//vUZPgG+wV2RFN+zNAAAA0gAAABLXnZDC57M1AAADSAAAAEiAyAAoEhmqaDk5kxTAsCKIQCjAxAINRMqIaDOJgGVxJWBwaFLquABlmVCAPFMFS5s8dXsxRQFQaQtLnKF6WYspdKwuSfZTFq7GnpgNrzNXAj0tj8ApfyGVN1f/4al0sdVv16t1Zon3Ip1MCRP6YdykG4tfo4BeGQNwh5rt+Dpc5kdb1+aSWwM/NWQyuLvZSOHDMfk+/mZm9VdlpMxPv+/7/P7JoajURrR6PRwxIofiNeUAW4iDd6xtwZDPyly1/ONKJH2znTxp9IV26+zv01DWdh9WRww48EzUe329VMQU1FMy4xMDBVIVAAAAYpAw3lOZKjM2QlbyFLKO0ypcNSODXgU3MnAooYyumKhhja+cKDjpKNEA4EDxUZSHmGBAoECR6YYHmXERgQAemGcBmYFSA5m5hZCgB4OAOIgCB0BYu4YCIBK3wEAgkQvVFpVJcwoAAo6FABJUiQsMx5oDKyIAaC3JjEaQ7LEfVZ7kMttOkqR813vNAJAAMAQX0EpgIATmdMGSGBAjwAT8PMDuDtLDgyqGdghsnCElCYXIEgDgiQBByJe8KCusaSDFadkrZZVEmnUywzqsZbjFmoN9M2XthbSHBerGBoUxRTeTtRizObjFhoHBkZcqbYI47dlkK2hcsWlZ6uKJOtH30mXbjNp/mpJ9uy7cqdx15VRNMj7uRt2KG1L7s1TUsAQ7alckxluMBU+Nm72N34al0/4hNbSA4ZdsGkpxS6BqapJbNulryKiqOrDlVxaOfoM32h6akFuXxOAvuy6VvnBkUpL0AHx/J2a2YVInQiRuJ8YnXmg9goUmkgRpYYOgpFdiAsMRdjGUoyZBMNVBZyMPBTJDGMA4XMxCDKkoiHzA4AvMOoD0wXE/THlDEAADY0AeMAHiIBIwEQLjAQAmCwApgMgAjgBIOAiHgFwuAIhoj+6IOAMX2gFZOj8mWNAAiwDCS7hoCmsItKAP42NWFSCHSZ//vUZPqG+zF2RFN+zNAAAA0gAAABLX3ZDE37M1AAADSAAAAES8Ym3VTOVJWmAKDgBQBDAfBMNBUMcwRwABIAlz7zXgMSUGJrl7k5BKM1DFKSsAOZUCDjDPKc+WArds8RkTLIJfx72aMxfF3Gcy9wH9h91J6IS6DZi0tlkjtSd2Fb9ySMvMX6h1Ylh0X+hdM8dOMO5qAO/H4Eh9hcNUj6QI3sNuhVkbtyGdgCO6vQ9PyC6/kolkzFuWZJJ25zsYjMzOS6pL4/Vhy/O0T2w6IFHY1KYLC0KdDdZt/rUFsNmcohBTj0crm2wuI3k9GLD6y525XNTjLmvv/Gq8jfqUsPd/IA8ECCBSUTXeM30rMikTsBoyV6NtBDK6s5V9MIUgOJBl4ZyPmPgxkIkZ0YAIaMHIioAAYDBSYLDiSIIEjFSgxMMIQMMqgZMfu/NQCOAQqotDQUGCINBADgQSQMGIYDawZcooAQIB0WA9LlG8wMABVZna3FsrTXUPAY5DsLysMnL6sfiENNwYhACVqw7yr2birYYRCWCgRMAg/O1F2Bwox5osUR5NEQtaZRKOIhKL8CNhAAZGSBEIzVYBI2MrRERMAytrk66EBwFnA78MgX8pJsK0Icyg6CWmN5A+4HTEYxNxpdbiN1wVtkUOMnkkCvTSy1VdNJhqxm9XtA8ojKtEugZQJtVjtZc1uC95e7dI8zZ5lpTT2a/ALhyWCI+3dyqeegVyZDF1Go+/0VeKdfaAn+a24sWb6jHR6WgijwIAFufLpbAdDMw9S3KKXQ1NS+NQHSRaOS2nzci5EcKsukD4SndJA8rt5gBgB1hAHkRyYXKBoY8mS0ybrJBw5mmzz0YyNJiEHhipTEMUA8w0uTNQpMUDN8SUJmGBKuwyMNyoChgHmIQUYDARiQMxl8Dpk98Z/YRBhUA5huIg4FwVDIwGA4wQCwwaA0mDcCAQXgEQFOEWbAoGBQGzAIJRYDgwAxoDwIAheFcZAAZVAAuSUACj4xMUABopZpVcVAW5HhkC0J//vUZP+A+yt2Q9N9zNAAAA0gAAABMAXXCE53M0gAADSAAAAETXGUs3TvMSxGZODRwO87RMJwULsw4pYWbNJgWiJkSIYvQ3YRiJJpCFlxY4yhB58hDS0BgzMG4wZFLDNoCT8LdJhLLS6pow7EAKyJSvqz5rzwMIkC70LEQFsIFsTUHfRUiH9hcy+k1Y60BH1qTLB05dap4dgdm8NPepXCWdT9FBdOviE0rjtrRtxf5rcgf+Xx6G3fon4c5/2vxpf8OyqVtwi8RZI1tu7Xog2TJ2H2hcRKpzZ4EU9DhDEhvA7q0TQJS4sYeJrctjMAQI/kZfpwpNEnhZ27MQiEZgKYeB6H8aBMwQ/UesilCAAAAAQgg4V2DEKQEBkCJQaXGBosXGBC6YlDZaM0eQBGLzGATJhKYSJwQJzC4dEQeEYOMVDEw2OzGoaEIjLuGDSIVAwYHoAxg0ARmDkMKAoeAwAAAAPg4B4wFAEzAiAyMAQBAHAOg4FIBAEAEA8lALJQApayguKQAGo8iABQaAILxlUAFhyqSNAiABFgEEe2fSxnCgLT0W0BbnrZU3fBlCt66jBCAdHgFTACBDMWwqIQAFtKiCxDpZmFhgcmYCocMwEQopUCQ5igCwwODa0x0zwgKAoupNeEOMrVbDK/EeFpKZyl6lVm6w5UaU09LF03yjsZUAZUvpYVYWWx9cNOzpt0jGuv/AURvL8ZgMmSxxIq6bRFSLNZS+ix33jbN3pb+Zbqy9utM0B7nVb52mNx1rFNI30cPFoT+S+DX7ZlDTA527atuS2Gfki6Ief3peV2ZTC6yta/2fzE9MOBI3ktPxLKsxUpHWaEz+G36fV75mHYfidK+sAOG7MTls80l/5XPQAdZRxnAMGNkQYfHphkFmpAsZ4JBVLxpogmHAUYaK48HjAoaMIlcziBzFpDKBKYwGAyGBIqGQxSh+FRSQDwQA4LAsHAGYTHofXAaYCAAJAkkqYCgyW6MAgqAoFzoBA8WAcSDJgiixgCBT9DIFoOq3qoOGnC//vUZPqG/Ad2QtOezNAAAA0gAAABK/3ZDE53E1AAADSAAAAEoGhLcdNhlyHd1EHlqKpLRctpjBGsGDABOC6jTlKDDcBF5EITBeKxYBEhaWVEIX2AszGYVKkUIjJfBAjURvQ4SBAqgECCEYwFPyJW3YhUukLkrucdgDLnBaJjDK0H/b9lbKmHUD7tiiEGw6+zi3WSwC1hiTby+XMcfh55ZI1b2OUTlSuWw9N0q74q9Tlx+W0lJCH+gq1FoNikKfh2Icn2hPi7zZ4LdNvXuj01gz6pJ5+7Dchjj4tvYnIzBS+qeYcqjJDzrkTlqCrEJZq+T+wNEYbht2M4JcKpyJytrTQX0eKZl1FyGHGhUxcob/EEAAYAdqrBpgPjBsNKhczCDjNpqMdroz0IjEhDGkoZdJrmmEiSYdYZiAjCSWEAjMFCQiIRiMVmASGYGIpigJmAhCYJCxg+KBjaC5iZgB/gMoGEUwLCgBAiCgpMAAcL3wSYfAwg2QAsEAkhoDhEDARMAwICA4MCQClKCiRSg48CRZxB4GgQHAO2dQ4KAeWAQZSuhMdH1OgiAUWBl0kA6gANAkwyAhAYDAvNN58FgXhmupIZSKQYmZAhQDDAyzsOgWGjRVHx7EtQzdQUG7bMHfb9gbjLGZlLH3RnYSwR32aYvuxlNWOJIM1Z28sOKdOneU2WWw5SydXO5D8w/F19O01duSuVhXFWGflxZ1rD/diLJ3uh1830ZfEF2xxiLS9QBFX9rw5IHTdVzW4N9TtHX9F3pYDCZHI4vH4jWuNceGVw5KHmc9Kmgd9ynTTNVtnYpVaeyvnIemcmZOVGZW5qvYizRmM8979yiXu5KVSMwb1/qR3Gvs5gmepuwPUTg8URjKBIMaLQ2KCjBofNtnY0QMAVbzIIzRZEjYYODxmNKGfGqaCIZjMGg4rEoHMGhswaQQEChAEjAIXFkGVQgDDNBEMDxAoyygXzBCAOKoEBIiJBmYNB5iYMDAjBACAAmAwHDAwKAgGhUWCIkEUhUJhKBguC//vUZPgG+8F2wjOdxNAAAA0gAAABLcHZCC57kgAAADSAAAAEUJ6I4MBYYCCyYBBjIVAV5Ixlvi8QsAXNfFewyCLRaxmikmYGLRGTAwLBI+J9wgwMpaa86lawbWIw2RgK3G3ayBQG2NFNbzAGDNMfBYjqLDQeyhQdt2LsidJy1lKrPm3FYq2GCvwzFp03GXWazHG7MwddFSDGnLBv2ydh03ALVr+TKIbaZK4cfN0n+b18LTOtxxksTe2N26Vl8DRCTP/EF0tMaFRxp0oW7LyrvgqzQwM7kGvtBS138idO3KlZVbgahlcSZ9er148h9D7lxOJMjgpsDiPtSPow5rrvsmTGZw9MahiB2W3ZS5NmItanY3FYnR9i0Wq4qj+FMTeAMzEMfTCgVDK4ZzHsRzGAKDGMQBAUJh0P5geDZgkFZhCBhn+MhkyDoyKJhIEohBYv4oKYKAQYJByDhLMFQJAwtiEBww3QQjAcRgMPQGkrAYApFMdEISCxgUOhw+MQBEwkLwUCiI3s3cYZAgVAaaxgAKK0ioDCoOU1U2BoNJgCvcdBAQEyYElgBDwNTpRrUk4qeg8CxGBlUlKFM27hcFmEBE2MvWf7qgsT2gNXSIXQk6re7OmHT70OrACk2rylpsZaE3RP1yFgndfZgk7I1+KhbIyV7F4qCo3v+u6+4b1uw891fS8C9sHM6YC6shThbyBFpWX9kDX3EeZJFVkIdRXTuNhZUtJ3I5OPFhEn5ij9rpXc05TuAV9LvnF1NihylqMjdlxJ+Go6yyHmd2Hqe17X2fabdOWL2lM0ueUtmeOBXTlsqb+OT75WX2XjL2nOhGJh0HwYjG4bmmWUznvtVZCu6XRSheKCYaUqgl9oZgJ/JZZ7gBmUxoQgJhmDBhiURgaJJncEhhANBhGEhhQUCBRhUDrSAULpgEXZgmCRgCCYjDUwnD8FA2XhMBARMGQmMOAMAIQBw/kAGmaIVGJPcGdo5oDxYPDDESAgHDEUFjCwGDBQDyygoAqRACAliygsYMGA//vUZPKO+692wgO+5IAAAA0gAAABLOnZCk7h/gAAADSAAAAEODAFEYDoKg0CKFfL9p9KzOYDgLBACqUF8lbUc428DISgEVjFAbreTpbu6pVClcoGAE2qKcoBCOK3NMQMVjBozAMtUKHIDlClZ2pMSERVAQaZIRqqA8uTtHnMGASwrWEdALhUn+dY4yXlvVRf4ODGP0uZKC5oSeZAQgJNB8MCtJWQw6WRQELJogi4psU4XBGLxL5y4HRZCCQrkbyEKtsmVqSTpvL55qBYbkWiSZqYlZqn6nDyV0J4eR3HQi07uHY41fOOFVKBPJmdQLbCrQozvRqXjoUf6E2bkQlZU8SEvxITSMRuV5eGFtUSuKYuVyYqlebCnwTaFWDVP4jfMcAGMZThMmh2MkgXMrjjMeyeMswIMiR/MLAVBgSg4DQEBBj0RRhSDRg4DhkIBxiWC4BAAwPBQxUEkwBDswYAUVFMwkA4xSFUyvC4yJ8Y53CEFB+CxZkyoFBCxYOcGpLmtLJEmoXhYKFRsEJCL1MUJDjwIFmYCKMww8ZCHjIwFqAAKCCafD3uCWtRKbCxZLkweBHqagr57xADlBBkIHsQcTCJQVujhlgCv6rcoQrTDjjKbNYViYIyuXNPctnE4oe4EMMSZyrE3eJS2JRhlLGYpJ0Uy8zOWSvYuxTJ+WUrOlkYehExj7UGurPYfGXOaiwBlCb7KoJVva/t+GKO07MTfdpDdmXyfOIM3hUPtDk7S11xl33jlspcdx2Ss8jcth9pr5tSZO47evs8blNLbozJrkWg6SwTVa6+jYGQxJaqzl7sheSgisXicMu2t1YWHKOHH1h9nM5F2dwmajcsrtHViaRAM+y6QQG1eUOU68Bz9fgMD++QzKUJjDkeTNgHTE8CjJ0ejB8JTF81THwGAITwMFMLg+YBCmYrBmYRhaYKjCHE4YPiMYXBwOA0PBoYIg4YJB6AiQRBMNQ5MeQIMTcOG47BQplnFcG2cCuTQ+NEpwU8nTBppbgMJMkUooc0kIAK//vUZPGG+5d2wgO65TAAAA0gAAABLTHZCK7nlMAAADSAAAAE4GHRPBgsOlyHYNQkgPXCxBdAoQNStPLAbVqUvuBgWutUy5VSFgDmAgKFg2dyLyAFMZXjIUzRgAMiS7l6oU0GSoitMVSLdrvpWUqSYg2s+vlZsjY+3duK5lL3YWBf+SyVrUYa8rllDD08JxqqVjfqGJLLuaVAcMsNWQwNc8FQzE3mcCXRdgbTKeErx237vNDe2SuDHpS8aymGttAsDxF2KFYGLtRdpxGopavOxKBZQ67+6jVaXYUtSnlENMLguRQ7SMahDXW2iMDNflLImuSiJxFnr/Ncf7kMyaDG5v6weGG4W7bWa1OyJ9IPaBBDEHAZ/LG0hmkkD8SjSjNNBTWdBTBIfDHwIDRAXiQvzOBFzBA1jG4oRoLjAsazGEoAaGwNBsmLEyeGExDBQwCCsxBBgxrD8UCQWEUFDgYMgmYAhwYQAMYthYY00gD8mMNAIUYGCgEHGTFkhgzLAyiwlCGpmAUYGPxJCY4wZQq4wWDmNMu5AyCOXGBAp9CMyOBwUYcYxQN0GVImKbydXIBDIcI2VNhdOJmAQkhQFBEdDXrSV6yZDUuMXVSilkZX6wRnSgNK7AFAaw0cfNOhmlI2j9gAAx1I17WsohKnc5pLLLUIyXI88zDq1WmqnhiMs5hCnKaC033ZIX/4k/Mt+yRrygrpp9IwsQUpiCmC6Wms1ZOnu/zpskaii030y2zTXMd7N5nyjjQWox13KGLydHWHrDkQKw+NwxNOrBUredQBkC4HcX7HHRdahbK7MzSMsaq0Jz3We6Ovq7z4RnNtmfuEv6EQM+sYi2TOI/DcNMmfKLLuQdhllriyeBIvXlVnpAkiGg4OkYJwkRmPMbg3mJNZnSmdy0mjcJzxGApw6EWNrOzGTg24vOJCDDlgomTEykWECUENaSzBMEAgIRQEDBQMQYG5giAxiyjh1SEgQKQUDQw/CYWF5A0SEwIC4LAQYLAiYGgcAAeMBAGfcQggl4QA//vUZPEG+4N2QYO65TAAAA0gAAABLnnZCy9vocAAADSAAAAEilGIwXaELBSgUAQORkLuOvEWZomkQNseDgDXY67L20ckUACNqoMrY4MACwAlAEyeLZDmsxqKtIWAsAgMuZiEeZmEAYlyoiDQJaiwcUAWhV0w4YAJ2YKiT+OEyhkGy2AkAKrl0IDH5fhMtyGaq7RJbipm3r9Q3BS92cMFd9n6tLor7f92V/rmwsOXLJWmssCyAuIztYFm8Waqo8w9pUOv+8Tyv/K3kawz9daYrSWWM7jDXYNnKZ/GtPvXiNuGYtHoYjkrcZ0Wmv9YtS9Z78UD+NOcl9muWrDcnhlqw0Mv84zU6leBG0WdHGnQ7FXcue12QTMUeuQSmGYbZyxL8Z2Ho3T41T+9TDZM/TFRcTA0gzEdBDV4CQazAkthoAKZkSDA0cYhD8wqEgxnLowxGswHAIEBkWAYAg7kIQmH4QixZmGQAipIgEODAQWzEAWDF0TDrURgKA4YGDSJixhmAo9iOO2BTUDREDQdIM0dMkEMSlWeGMRAKAAgxoEwhpQcIDlyi/w0TTUKoJSbNVThg5MRW150FVAWARRmqOKYxg4EXQLJGp9oEBiAHWwvUuYrlnq0WTOcgcrpnjD0z0VoFSMZkjkyaIWEvYmj4ztsKymBO0lkzJmiOb7MLTFSxZ497jw5We9gDlShQ1ojesGY4yZaTcXJlqHVyYFcFStCYp0wqVJnpvULWZS2Z3leQG0qJuE/ajUglkka2wZiLTXMZ++rsxt71yNAehrLvwDALdYMcWURhe61Y81qNxqXPxBWTru9EHezVujzksoWUsM+9SNrsfSkUDTdbFL2lSlrj/MgV9XtvO5a1XLlDrsrhpbEam3gTHZTL6eethQAdXz4dsg4ZWGGZwicYbioZOg8ZngyYQguYHBuYyiGBBnMFwSAQtGSY8mARbiMPTFwVgoAxgOFYBBoxRAkw0EMwHDQwHDAwsAUxJE8w0CsUMk3TFowvBE4cUExvIhZcylR0sxl//vUZOyG+592wYO63TAAAA0gAAABLlHbCM7ndMAAADSAAAAETVIE0geANFDS7MBA2ACTJHTJChCMzBE1BhVPuBC55FUj0EhDLKwAjAYiW8JVHOJg1jb7pprlFiBdoFDzEb5PdnjEmBpSgoOWOJBKvQqBrBl9C6CO6JKx3hdNBuHRUDlsGO+3eDGgqecpHZrzoMcnWlpxKaOPIm1ZgsW65D1I9QMwuNS1zVhJeocj0qkVgUVUEcqA0q4WuiUzqg0BNIxX5m91IuaKtcXPLqz3pqNeelYzqw0sm3BS/onjG2k/GpM/NeDINa006TrqbyAlM3XjMOwczSmeeSs2poZboydhbyLoh53IKgJjdtnHclhnalEZcemaHBT1MQjMJeR54GeRpkufyCpG8UvgJuE9dnOKIAAEAGm4c8Zm4UZgMB8A0MEwLQZDB5A9OTGExmKzJAQMoBIxsjzEpbMbG8KAg0yFjKQiMigwxMIzCgIMOgYyoGwNEDAwCMRgIxWATEJDMWhswdHTWI2MCi8xciEQcYiOggNLOBhKZKDAISEIGYEFmChaYr4lrwQIpVGGiAqEBAEBiqZLdMlLzJMpZJ9qOCQaXoKAsLA08rITAxEOrFVK7irkRwcEtcNmpx4QLvKQbAYSCBQGQzLSRpw5CjU01WctYoYmgDgtRcLgpeFNeBmxNs/Tlu837opcrFdljcBO6/qgKPNLDjgu80deqqjWWGLbY602A40mmnA06hrrhU0kCgMZSYVaylxKJOhWt3X1ZimUyJab9QRBdG2W9KX3pG9bV77i9ode2H4woM7TJW4TjO3pclQVwoDmn2poiyyLO+3aIu81txYy4C8Ja0HB6mcw7T3XQzbI8C5n5hLCLbBYDeJUTPn0kMsQkuw28LYEvV5Zp0IJh6B4Ch2VWRhsHPBtWF5gSCZk+HxiUVJgsW5ywsYQYHBKQsNG0GpCAgREMDUTISMxcQCqEaCTu4BRQOIRQCVgUvIvwzYUMgNDNPs0QUMDASEgYaKZE0ZsGYIS//vUZOcG+991wjPc2XIAAA0gAAABKqHbCg7vRcAAADSAAAAEZAOacqnSnYDg4YbbkJMZYKiACMaEClKANO8lCt8mGAhxhQy91fAo2sVAY1OLJvGBCzCNDdJ1OVYNJZHVmx+aS52CQ20pfcRfyBm3lz7NHgNyGLOxIbsAuu0mbgKPsAhDyuAvOdZ/DLqxxDR5n6f9pEuZXG4++653AZoqqqVzXIZmu6DHcpHpXhx41hWDNya26jjrNf9sEFsuhTuyp0XsgWzYjbm3Zc4bW7rqvo9mMUd5/GkQS78uk3Wcthd2UR+NU7tP/RLvrRVrbd3/gB9X0nIyzx4IdaZLpbCW8kE497Jn1eWOvu17s9bgCZgaaf2OwJD009EHtKqR+q6kiht5IhOVOwgABIBoTnpGBSIQYNgcJgkAKGKqEUYeAWxhWwGMGOaXaZnMImGhiY1NQAAQ98DPiMMbIk0kbzHJeBx2MAnsGC0wQBBQ0GcRSioY/GAjHJkasnejEYHEJIZmAAQQfmTHIUIRYVKDdBEkOLDRjgWiiYCLGaAQGDS/BhY0FwZGkOEy6hgwIX6MQFhGCItgEHKgcAgorFFkqLhUCSWL4Dx4wZ8kBw8AlozAAYABB3jCiwEATdX5EihLkFAiZTFxQNUbGgZJoUBRoiIQljAkCLlRrGgYVCWCLyb1rDoiw4IQJXaghKGs/QggqSQpOOXqkZOpJQeOJXgwFSTScRsXamJH19O0DQR3W9elIVqbM0hk9ZoaAGXLqVTpFyvoxFx06HDaPLYtJVtuE7sfZU2dwVrM9f2Rq4Zi5ZdZb9K11mlxOpbcvly12eJ3pzS5S9pcum30jScUG5uQ8LPn3UuirXXnYWz9aLNl6rulrsO5Dq/n1d95Y+tBFBxIcfJhkYeh1Vh0zHZajOvcwl1WVjAGre47ndRgesU8aLEeYLAAZMEYYeAAY/EyZOEwYgjyYVgkYpDeYeheGDYCiMMXxeKEaGgRMRQCAQFiQUGF4KmBAQGDwEgwRQUCC/gMKAGI//vUZOyG/Hx2wTPc2XAAAA0gAAABKy3XCq7p9QgAADSAAAAE0wYG0msFPcyoxO4DIjPlBCnSaM6KRXEIwCii4oQEBp9cBhESSAWAo4F9GCs5aKhNFjJb5J1BEgDYARBkmFUEeEJBEATUYo7u1hVNioGS2D4Sm6gzzLSDdQkWw/EMYx/j7JaDgLAEAYAojjTzKKRGPBOoFWoUQowyADqE0NMwEJQZbkw9LuhitRp+mNcgBXhawtSjMUyyuOkR4zjsbDQSBvKonqmUpnpsmJ/LliaRnH0P802NPGSp0NW0+uDkZhwGMgjfVp/olcSqNSRUidaXU65VKpYlUgXzpuV5cCPL+aaJIpXNK2+cS3ItrUaoLextaccFScJfkW8J4dMrBIaCxMgS9EOcDdL4nUc5J12rX04+HpQdZzHDUMknwyaNTy+SMSIs3KMDCoLMgNE0+CTK4rMfjExaODpTWCyWBVRMCkMwWFIwvE4wlAUxwF0eDsRgoHAcYnDoYpBODChOWBcGhICgdGHwMioGFgPxUVjDABh0JzBYPBEEAhAcSBRkxgACw4BRVA5GowmAwEAJHQqAaaJCDAIBAwAAcQAok8DAIMBQqCgAmCIJAkCDBkCi46HMSCMCAK/AQA4sCSwDGocV6BkkEhDbQtHDygq53lYerpJ9WIWA9h7yuuMAC+jcwwDb6/hYE4UpYlsOAGuZFRS6A1vEgAtshNMAgAeBCYzQcANJJY9WXMOT7cNbKqDc0x249TkAQALBqUiQFJrGAoEoUJ1CwBV0bwgCEfC7TqzKKrntKpWHs3bu6KjKXroJctediHmOpXOLEm4q1I7rtZ6jmtZAMko1ZYVNd1UjmkwpSxy0pbLcIDbpSuND6ul2u6vyWO1OoEXRc5kCx1ss6bg+iNyK7wtDpUgEEDbP+pQ/7L24QpYyX8eUthLEUskQ05myIJGLtih2UOrElWAAGRCAAgAMEAAADiYZNCMA1TCDY6nfswMDwjQgAVnBjQGMUcBwJAwXH40rBKFmaCgt//vUZOYADNB1wIVzoAIAAA0goAABNTIdFZnNgAAAADSDAAAAcZAhgbeIiw3IbOdUEem5mThxyCiFQQ1ZXMMIDYwRD5lTcQE6GWA4UEQy1NaTzN0QVBGBPiYICBgSVgqhI0ImLDpnSOYymCh+Y0fpvU0Mt2fUDBBgQMZkKGKhZjAeZeKjCAYeaggzMWKjISsRksh20mKPSwFezAFcJpxdpyYZkw4ZeSg4vDlwykPAyEEJMYXywGGFkspiCgcXSJXOuv0zkIwhDMlEjHBEDERjo4YUOgkUMPIFkuzJGeymagms7i61C5NB6ebkUasbXBwfCwsCRoCi5hAoOBhhYaYkKBAQHFdq7Er80+1O8ThSt6HjeCTQzUZwxyJMcY4+zODEgYSGRYmGiABDpiIINAphwaYGGBQHMCDxGJCoa3Z9ptu0NULxU1WPbx00x9XkZZE4hGIm98hgnHkpaH///////////+IAkRBQJESEFMEADBQ1CsSEAEJkQMPCokHgYSBwKlF////////////Kb1WGbEEwzSQDDNR4ZTcgmkxBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqoAIKjSroiGbKnaZsKnzAT9MhRVeZgKYqgrEYrEmHMSYBvDiZxuiGlhJkBmSgcQmTOSkTU4TuFuSpKiFMY3RNTh//vUZCAP+Np1sD9h4AAAAA0g4AABACQCAASAACAAADSAAAAEO4HMcKKQpvLaTlGroI8LidKGoay6tBiE9FtFxSp/EGQpEkJSYNkMFKDeBzHEdo9LGJKJisD6EOLEdomqrG6OFkJUJscR2iatJbS4vC3D1IUiSCrSdUMBPGkqjtCOlynwxJ5XRstpfhbiFKpEk5QlFFyPYC8Dedn6TlCUUTpgG8OJbJSLicJ3D1Mg3iFM5KRcThRQ9TgW4uSjDhAyjFJkDmPElRLmMbompwooW46abeq1WxbMR+ltNHWLbzXL17qE+jQXuWFl0+V0aCy3YWXT5XRoKt29e6fPo2XtgtVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//vUZAAP8AAAaQAAAAgAAA0gAAABAAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";

  const TABS = [
    { key:'Dashboard', page:'pageDashboard' },
    { key:'Einzelläufe', page:'pageEinzellaeufe' },
    { key:'Dauerschleife', page:'pageDauerschleife' },
    { key:'Teamrennen', page:'pageTeamrennen' },
    { key:'Langstrecke', page:'pageLangstrecke' },
    { key:'Stammdaten', page:'pageStammdaten' },
    { key:'Strecken', page:'pageStrecken' },
    { key:'Renntag', page:'pageRenntag' },
    { key:'Renntag Auswertung', page:'pageRenntagAuswertung' },
    { key:'Saison', page:'pageSaison' },
    { key:'Saison Auswertung', page:'pageSaisonAuswertung' },
    { key:'Audio', page:'pageAudio' },
    { key:'Einstellungen', page:'pageEinstellungen' },
  ];

  const I18N = {
    de: {
      'tab.pageDashboard':'Dashboard',
      'tab.pageEinzellaeufe':'Einzelläufe',
      'tab.pageDauerschleife':'Dauerschleife',
      'tab.pageTeamrennen':'Teamrennen',
      'tab.pageLangstrecke':'Langstrecke',
      'tab.pageStammdaten':'Stammdaten',
      'tab.pageStrecken':'Strecken',
      'tab.pageRenntag':'Renntag',
      'tab.pageRenntagAuswertung':'Renntag Auswertung',
      'tab.pageSaison':'Saison',
      'tab.pageSaisonAuswertung':'Saison Auswertung',
      'tab.pageAudio':'Audio',
      'tab.pageEinstellungen':'Einstellungen',
      'header.subtitle':'offline • HTML/JS/CSS • build {build}',
      'settings.saved':'Gespeichert.',
      'settings.saved_log':'Einstellungen gespeichert',
      'settings.language':'Sprache',
      'settings.language_de':'Deutsch',
      'settings.language_en':'Englisch',
      'settings.general':'Allgemein',
      'settings.header_name':'Name im Header',
      'settings.save':'Speichern',
      'session.title':'Session Control',
      'session.quick_status':'Quick Status',
      'session.timer':'Timer',
      'session.current_mode':'Aktueller Modus',
      'session.track':'Strecke',
      'session.minimum_time':'Mindestzeit',
      'session.track_record':'Streckenrekord',
      'session.day_record':'Tagesrekord',
      'session.start':'Start',
      'session.pause':'Pause',
      'session.resume':'Weiter',
      'session.stop':'Stopp',
      'session.free_driving':'Freies Fahren',
      'session.on':'an',
      'session.off':'aus',
      'session.waiting_for_start':'wartet auf Start',
      'session.free_driving_desc':'Startet sofort ohne Ampel, aber mit normaler Session und Ansagen.',
      'session.start_light':'Startampel',
      'session.start_light_before':'Ampel vor Start',
      'session.start_light_sequence':'Ablauf: 5,4,3,2,1 (warten) Start',
      'session.control_hint':'Start/Stop/Pause/Weiter steuert den aktuell aktiv gesetzten Rennmodus (inkl. Dauerschleife).',
      'badge.season':'Saison: {name}',
      'badge.raceday':'Renntag: {name}',
      'mode.free_driving':'Freies Fahren',
      'mode.none':'—',
      'mode.single':'Einzelläufe: {submode}',
      'mode.team':'Teamrennen',
      'mode.loop':'Dauerschleife • {phase}',
      'mode.endurance':'Langstrecke',
      'submode.training':'Training',
      'submode.qualifying':'Qualifying',
      'submode.race':'Rennen',
      'submode.setup':'Aufstellphase',
      'submode.ampel':'Ampel',
      'submode.podium':'Podium',
      'renntag.title':'Renntag',
      'renntag.none':'Kein Renntag.',
      'renntag.intro':'Renntag und Session auswählen.',
      'renntag.select_day':'Renntag auswählen',
      'renntag.new_day':'+ Neuer Renntag',
      'renntag.select_session':'Rennen/Session',
      'renntag.no_sessions':'(keine Sessions)',
      'renntag.delete_session':'Lauf/Session löschen',
      'renntag.delete_all_sessions':'Alle Sessions dieses Renntags löschen',
      'renntag.badge_laps':'Runden: {count}',
      'renntag.badge_drivers':'Fahrer: {count}',
      'renntag.badge_cars':'Autos: {count}',
      'renntag.preview_title':'Renntag Discord Vorschau',
      'renntag.copy_forum':'Forum-Text kopieren',
      'renntag.send':'Renntag an Discord senden',
      'session.preview_title':'Session Discord Vorschau',
      'session.send':'Session an Discord senden',
      'preview.text':'Text',
      'preview.image':'Bild',
      'preview.loading':'Lade Vorschau...',
      'preview.loading_image':'Lade Bild...',
      'preview.failed':'Vorschau konnte nicht geladen werden.',
      'preview.no_session':'Keine Session ausgewaehlt.',
      'renntag.created':'Neuer Renntag erstellt.',
      'renntag.sent':'Renntag gesendet.',
      'renntag.send_failed':'Renntag-Webhook fehlgeschlagen.',
      'renntag.copied':'Renntag-Text kopiert.',
      'session.sent':'Session gesendet.',
      'session.send_failed':'Session-Webhook fehlgeschlagen.',
      'season.title':'Saison',
      'season.intro':'Automatisch angelegt, umbenennbar, beendbar.',
      'season.active':'Aktive Saison',
      'season.name':'Name',
      'season.save':'Speichern',
      'season.end':'Saison beenden',
      'season.new':'+ Neue Saison',
      'season.preview_title':'Saison Discord Vorschau',
      'season.copy_forum':'Forum-Text kopieren',
      'season.send':'Saison an Discord senden',
      'season.no_active':'Keine Saison aktiv.',
      'season.status_active':'aktiv',
      'season.status_closed':'beendet',
      'season.new_name':'Saison {year} (neu)',
      'season.saved':'Gespeichert.',
      'season.ended':'Saison beendet. Neue Saison erstellt.',
      'season.created':'Neue Saison erstellt.',
      'season.sent':'Saison gesendet.',
      'season.send_failed':'Saison-Webhook fehlgeschlagen.',
      'season.copied':'Saison-Text kopiert.',
      'renntag.select_day':'Renntag auswählen',
      'renntag.select_session':'Rennen/Session',
      'renntag.delete_session':'Lauf/Session löschen',
      'renntag.delete_all_sessions':'Alle Sessions dieses Renntags löschen',
      'copy.failed':'Kopieren fehlgeschlagen.',
      'button.sending':'Sende...',
      'dashboard.free_driving':'Dashboard • Freies Fahren',
      'dashboard.race_result':'Dashboard • Rennergebnis',
      'dashboard.placement':'Dashboard • Platzierung',
      'dashboard.drivers':'Dashboard • Fahrerübersicht',
      'dashboard.teams':'Dashboard • Teams',
      'dashboard.live_laps':'Dashboard • Aktuelle Rundenzeiten',
      'dashboard.view_auto':'Auto',
      'dashboard.view_race':'Rennen',
      'dashboard.view_drivers':'Fahrer',
      'dashboard.view_live':'Live',
      'dashboard.view_teams':'Teams',
      'dashboard.sort_best':'Bestzeit',
      'dashboard.sort_last':'Letzte Runde',
      'dashboard.sort_name':'Name',
      'dashboard.live_intro':'Live-Ansicht der letzten gemessenen Runden.',
      'dashboard.no_laps':'Noch keine Runden.',
      'dashboard.no_teams':'Keine Teams angelegt.',
      'dashboard.team_intro':'Teamwertung: Runden (primaer), Gesamtzeit als Tie-Breaker.',
      'dashboard.team_intro_endurance':'Regelverstoesse geben Strafsekunden; ab Schwellwert werden nach Rennende Runden abgezogen.',
      'dashboard.team_intro_regular':'Best-/Letzte Runde und Durchschnittsgeschwindigkeit je Team.',
      'dashboard.no_team_laps':'Noch keine Runden.',
      'dashboard.driver_intro_race':'Rangliste (aktuelles Rennen) • Letzte Runde + Schnellste Runde + MRC Δ + Durchschnittsgeschwindigkeit + Gesamtzeit.',
      'dashboard.driver_intro_idle':'Fahrerübersicht (Letzte Runde + Schnellste Runde + MRC Δ + Durchschnittsgeschwindigkeit).',
      'dashboard.no_driver_data':'Noch keine Daten.',
      'dashboard.race_intro':'Rangliste (aktuelles Rennen) • sortiert nach Platzierung.',
      'dashboard.no_race_laps':'Noch keine Runden im Rennen.',
      'dashboard.live_hint':'Tipp: Du kannst rechts oben auf „Live“ umschalten, wenn du die letzten Runden sehen willst.',
      'dashboard.unknown':'Unbekannt',
      'dashboard.driver':'Fahrer',
      'dashboard.team':'Team',
      'dashboard.car':'Auto',
      'dashboard.lap':'Runde',
      'dashboard.phase':'Phase',
      'dashboard.laps':'Runden',
      'dashboard.total_time':'Gesamtzeit',
      'dashboard.best':'Best',
      'dashboard.last':'Letzte',
      'dashboard.mrc_delta':'MRC Î”',
      'dashboard.average_kmh':'Ã˜ km/h',
      'dashboard.sort_title':'Sortierung',
      'dashboard.sort_prefix':'Sort: {label}',
      'common.active':'AKTIV',
      'common.inactive':'inaktiv',
      'common.team':'Team',
      'common.teams':'Teams',
      'common.no_data':'Keine Daten.',
      'common.no_free_drivers':'Keine freien Fahrer.',
      'common.search_name_placeholder':'Name...',
      'common.saved':'Gespeichert.',
      'single.title':'Einzellaeufe',
      'single.hint':'"Aktiv setzen" -> Session Control links steuert Start/Stop/Pause/Weiter.',
      'single.submode':'Submodus',
      'single.finish_after':'Lauf endet nach',
      'single.limit_none':'Kein Limit',
      'single.limit_time':'Zeit',
      'single.limit_laps':'Runden',
      'single.time_minutes':'Zeit (Minuten)',
      'single.laps':'Runden',
      'single.activate':'Aktiv setzen',
      'single.info':'Info',
      'single.info_body':'Start/Stop laeuft links.',
      'single.activated':'Einzellaeufe aktiv.',
      'single.log_activated':'Modus aktiv: Einzellaeufe ({submode})',
      'team.title':'Teamrennen',
      'team.search_driver':'Fahrer suchen',
      'team.finish':'Ziel / Ende',
      'team.finish_manual':'Manuell',
      'team.time_limit_min':'Zeitlimit (Min.)',
      'team.lap_limit':'Rundenlimit',
      'team.points_scheme':'Punkte je Platz',
      'team.points_placeholder':'z.B. 10,8,6,5,4,3,2,1',
      'team.points_hint':'Platz 1 bis n, Rest erhaelt 0 Punkte.',
      'team.drag_hint':'Ziehe Fahrer in ein Team. Zugewiesene Fahrer verschwinden hier automatisch.',
      'team.add':'+ Team',
      'team.activate':'Aktiv setzen',
      'team.deactivate':'Deaktivieren',
      'team.points_title':'Teamwertung ueber Punkte',
      'team.points_intro':'Fahrer werden nach Platzierung bepunktet, Teams nach Punktesumme gewertet.',
      'team.members':'Mitglieder',
      'team.driver':'Fahrer',
      'team.points':'Punkte',
      'team.time':'Zeit',
      'team.drop_remove':'Hierhin ziehen, um Fahrer aus Team zu entfernen',
      'team.delete_title':'Team loeschen',
      'team.drop_here':'Fahrer hier ablegen...',
      'team.added':'Team hinzugefuegt',
      'team.activated':'Teamrennen aktiv',
      'team.deactivated':'Teamrennen deaktiviert',
      'team.name_saved':'Teamname gespeichert',
      'team.deleted':'Team geloescht',
      'team.not_empty':'Team ist nicht leer',
      'team.default_name':'Team {n}',
      'endurance.title':'Langstrecke',
      'endurance.duration_min':'Rennlaenge (Minuten)',
      'endurance.min_stint':'Mindestrunden pro Stint',
      'endurance.max_stint':'Maximalrunden pro Stint (0 = aus)',
      'endurance.penalty_seconds':'Strafzeit pro Regelverstoss (Sekunden)',
      'endurance.penalty_threshold':'Rundenabzug ab Strafzeit gesamt (Sekunden, 0 = aus)',
      'endurance.penalty_laps':'Abzuziehende Runden pro Schwellwert',
      'endurance.intro':'Langstrecke wird immer als Zeitrennen gewertet. Jeder Stint muss mindestens diese Rundenzahl erreichen. Optional kann auch eine maximale Rundenzahl pro Stint geprueft werden. Bei Regelverstoessen werden Strafsekunden addiert; ab dem gesetzten Schwellwert werden nach Rennende Runden abgezogen.',
      'endurance.search_driver':'Fahrer suchen',
      'endurance.drag_hint':'Ziehe Fahrer in ein Team. (Langstrecke: Teams fahren nacheinander.)',
      'endurance.add':'+ Team',
      'endurance.activate':'Aktiv setzen',
      'endurance.deactivate':'Deaktivieren',
      'endurance.note_status':'Mindeststint und aktive Fahrer/Stints findest du im Session Control, Dashboard und Presenter.',
      'endurance.status_title':'Langstrecke - Aktive Fahrer / Stints',
      'endurance.active_driver':'Aktiver Fahrer',
      'endurance.stint':'Stint',
      'endurance.status':'Status',
      'endurance.car':'Auto',
      'endurance.status_ok':'OK',
      'endurance.rule_violation':'Regelverstoss',
      'endurance.min_label':'min',
      'endurance.max_label':'max',
      'endurance.drop_remove':'Hierhin ziehen, um Fahrer aus Team zu entfernen',
      'endurance.delete_title':'Team loeschen',
      'endurance.drop_here':'Fahrer hier ablegen...',
      'endurance.added':'Team hinzugefuegt',
      'endurance.activated':'Langstrecke aktiv',
      'endurance.activate_failed':'Aktivieren fehlgeschlagen',
      'endurance.deactivated':'Langstrecke deaktiviert',
      'endurance.name_saved':'Teamname gespeichert',
      'endurance.deleted':'Team geloescht',
      'endurance.not_empty':'Team ist nicht leer',
      'endurance.default_name':'Team {n}',
      'endurance.log_activated':'Langstrecke aktiviert: {duration} Min, Mindeststint {minStint}, Max-Stint {maxStint}, Strafe {penalty}s, Rundenabzug ab {threshold}s: {laps}'
    },
    en: {
      'tab.pageDashboard':'Dashboard',
      'tab.pageEinzellaeufe':'Single Runs',
      'tab.pageDauerschleife':'Loop Mode',
      'tab.pageTeamrennen':'Team Race',
      'tab.pageLangstrecke':'Endurance',
      'tab.pageStammdaten':'Master Data',
      'tab.pageStrecken':'Tracks',
      'tab.pageRenntag':'Race Day',
      'tab.pageRenntagAuswertung':'Race Day Analysis',
      'tab.pageSaison':'Season',
      'tab.pageSaisonAuswertung':'Season Analysis',
      'tab.pageAudio':'Audio',
      'tab.pageEinstellungen':'Settings',
      'header.subtitle':'offline • HTML/JS/CSS • build {build}',
      'settings.saved':'Saved.',
      'settings.saved_log':'Settings saved',
      'settings.language':'Language',
      'settings.language_de':'German',
      'settings.language_en':'English',
      'settings.general':'General',
      'settings.header_name':'Header name',
      'settings.save':'Save',
      'session.title':'Session Control',
      'session.quick_status':'Quick Status',
      'session.timer':'Timer',
      'session.current_mode':'Current mode',
      'session.track':'Track',
      'session.minimum_time':'Minimum time',
      'session.track_record':'Track record',
      'session.day_record':'Day record',
      'session.start':'Start',
      'session.pause':'Pause',
      'session.resume':'Resume',
      'session.stop':'Stop',
      'session.free_driving':'Free driving',
      'session.on':'on',
      'session.off':'off',
      'session.waiting_for_start':'waiting for start',
      'session.free_driving_desc':'Starts immediately without lights, but with a normal session and announcements.',
      'session.start_light':'Start lights',
      'session.start_light_before':'Lights before start',
      'session.start_light_sequence':'Sequence: 5,4,3,2,1 (wait) Start',
      'session.control_hint':'Start/Stop/Pause/Resume controls the currently active race mode (including loop mode).',
      'badge.season':'Season: {name}',
      'badge.raceday':'Race day: {name}',
      'mode.free_driving':'Free driving',
      'mode.none':'—',
      'mode.single':'Single Runs: {submode}',
      'mode.team':'Team Race',
      'mode.loop':'Loop Mode • {phase}',
      'mode.endurance':'Endurance',
      'submode.training':'Training',
      'submode.qualifying':'Qualifying',
      'submode.race':'Race',
      'submode.setup':'Grid phase',
      'submode.ampel':'Lights',
      'submode.podium':'Podium',
      'renntag.title':'Race Day',
      'renntag.none':'No race day.',
      'renntag.intro':'Select race day and session.',
      'renntag.select_day':'Select race day',
      'renntag.new_day':'+ New race day',
      'renntag.select_session':'Race/Session',
      'renntag.no_sessions':'(no sessions)',
      'renntag.delete_session':'Delete run/session',
      'renntag.delete_all_sessions':'Delete all sessions of this race day',
      'renntag.badge_laps':'Laps: {count}',
      'renntag.badge_drivers':'Drivers: {count}',
      'renntag.badge_cars':'Cars: {count}',
      'renntag.preview_title':'Race Day Discord Preview',
      'renntag.copy_forum':'Copy forum text',
      'renntag.send':'Send race day to Discord',
      'session.preview_title':'Session Discord Preview',
      'session.send':'Send session to Discord',
      'preview.text':'Text',
      'preview.image':'Image',
      'preview.loading':'Loading preview...',
      'preview.loading_image':'Loading image...',
      'preview.failed':'Preview could not be loaded.',
      'preview.no_session':'No session selected.',
      'renntag.created':'New race day created.',
      'renntag.sent':'Race day sent.',
      'renntag.send_failed':'Race day webhook failed.',
      'renntag.copied':'Race day text copied.',
      'session.sent':'Session sent.',
      'session.send_failed':'Session webhook failed.',
      'season.title':'Season',
      'season.intro':'Created automatically, can be renamed and closed.',
      'season.active':'Active season',
      'season.name':'Name',
      'season.save':'Save',
      'season.end':'End season',
      'season.new':'+ New season',
      'season.preview_title':'Season Discord Preview',
      'season.copy_forum':'Copy forum text',
      'season.send':'Send season to Discord',
      'season.no_active':'No active season.',
      'season.status_active':'active',
      'season.status_closed':'closed',
      'season.new_name':'Season {year} (new)',
      'season.saved':'Saved.',
      'season.ended':'Season ended. New season created.',
      'season.created':'New season created.',
      'season.sent':'Season sent.',
      'season.send_failed':'Season webhook failed.',
      'season.copied':'Season text copied.',
      'renntag.select_day':'Select race day',
      'renntag.select_session':'Race/Session',
      'renntag.delete_session':'Delete run/session',
      'renntag.delete_all_sessions':'Delete all sessions of this race day',
      'copy.failed':'Copy failed.',
      'button.sending':'Sending...',
      'dashboard.free_driving':'Dashboard • Free Driving',
      'dashboard.race_result':'Dashboard • Race Result',
      'dashboard.placement':'Dashboard • Standings',
      'dashboard.drivers':'Dashboard • Driver Overview',
      'dashboard.teams':'Dashboard • Teams',
      'dashboard.live_laps':'Dashboard • Latest Laps',
      'dashboard.view_auto':'Auto',
      'dashboard.view_race':'Race',
      'dashboard.view_drivers':'Drivers',
      'dashboard.view_live':'Live',
      'dashboard.view_teams':'Teams',
      'dashboard.sort_best':'Best lap',
      'dashboard.sort_last':'Last lap',
      'dashboard.sort_name':'Name',
      'dashboard.live_intro':'Live view of the most recently measured laps.',
      'dashboard.no_laps':'No laps yet.',
      'dashboard.no_teams':'No teams created.',
      'dashboard.team_intro':'Team standings: laps first, total time as tie-breaker.',
      'dashboard.team_intro_endurance':'Rule violations add penalty seconds; after the threshold, laps are deducted after the race.',
      'dashboard.team_intro_regular':'Best/last lap and average speed per team.',
      'dashboard.no_team_laps':'No laps yet.',
      'dashboard.driver_intro_race':'Standings (current race) • Last lap + fastest lap + MRC delta + average speed + total time.',
      'dashboard.driver_intro_idle':'Driver overview (last lap + fastest lap + MRC delta + average speed).',
      'dashboard.no_driver_data':'No data yet.',
      'dashboard.race_intro':'Standings (current race) • sorted by position.',
      'dashboard.no_race_laps':'No race laps yet.',
      'dashboard.live_hint':'Tip: You can switch to “Live” at the top right to see the latest laps.',
      'dashboard.unknown':'Unknown',
      'dashboard.driver':'Driver',
      'dashboard.team':'Team',
      'dashboard.car':'Car',
      'dashboard.lap':'Lap',
      'dashboard.phase':'Phase',
      'dashboard.laps':'Laps',
      'dashboard.total_time':'Total time',
      'dashboard.best':'Best',
      'dashboard.last':'Last',
      'dashboard.mrc_delta':'MRC delta',
      'dashboard.average_kmh':'Avg km/h',
      'dashboard.sort_title':'Sorting',
      'dashboard.sort_prefix':'Sort: {label}',
      'common.active':'ACTIVE',
      'common.inactive':'inactive',
      'common.team':'Team',
      'common.teams':'Teams',
      'common.no_data':'No data.',
      'common.no_free_drivers':'No free drivers.',
      'common.search_name_placeholder':'Name...',
      'common.saved':'Saved.',
      'single.title':'Single Runs',
      'single.hint':'"Set active" -> Session Control on the left handles start/stop/pause/resume.',
      'single.submode':'Submode',
      'single.finish_after':'Run ends after',
      'single.limit_none':'No limit',
      'single.limit_time':'Time',
      'single.limit_laps':'Laps',
      'single.time_minutes':'Time (minutes)',
      'single.laps':'Laps',
      'single.activate':'Set active',
      'single.info':'Info',
      'single.info_body':'Start/stop is handled on the left.',
      'single.activated':'Single runs active.',
      'single.log_activated':'Mode active: Single Runs ({submode})',
      'team.title':'Team Race',
      'team.search_driver':'Search driver',
      'team.finish':'Finish / End',
      'team.finish_manual':'Manual',
      'team.time_limit_min':'Time limit (min)',
      'team.lap_limit':'Lap limit',
      'team.points_scheme':'Points per place',
      'team.points_placeholder':'e.g. 10,8,6,5,4,3,2,1',
      'team.points_hint':'Places 1 to n, the rest receive 0 points.',
      'team.drag_hint':'Drag drivers into a team. Assigned drivers disappear here automatically.',
      'team.add':'+ Team',
      'team.activate':'Set active',
      'team.deactivate':'Deactivate',
      'team.points_title':'Team scoring by points',
      'team.points_intro':'Drivers score by finishing position, teams rank by total points.',
      'team.members':'Members',
      'team.driver':'Driver',
      'team.points':'Points',
      'team.time':'Time',
      'team.drop_remove':'Drop here to remove drivers from a team',
      'team.delete_title':'Delete team',
      'team.drop_here':'Drop drivers here...',
      'team.added':'Team added',
      'team.activated':'Team race active',
      'team.deactivated':'Team race deactivated',
      'team.name_saved':'Team name saved',
      'team.deleted':'Team deleted',
      'team.not_empty':'Team is not empty',
      'team.default_name':'Team {n}',
      'endurance.title':'Endurance',
      'endurance.duration_min':'Race length (minutes)',
      'endurance.min_stint':'Minimum laps per stint',
      'endurance.max_stint':'Maximum laps per stint (0 = off)',
      'endurance.penalty_seconds':'Penalty time per rule violation (seconds)',
      'endurance.penalty_threshold':'Lap deduction from total penalty time (seconds, 0 = off)',
      'endurance.penalty_laps':'Laps deducted per threshold',
      'endurance.intro':'Endurance is always scored as a timed race. Each stint must reach at least this many laps. Optionally a maximum lap count per stint can also be checked. Rule violations add penalty seconds; once the threshold is reached, laps are deducted after the race.',
      'endurance.search_driver':'Search driver',
      'endurance.drag_hint':'Drag drivers into a team. (Endurance: teams drive one after another.)',
      'endurance.add':'+ Team',
      'endurance.activate':'Set active',
      'endurance.deactivate':'Deactivate',
      'endurance.note_status':'You can find minimum stint and active drivers/stints in Session Control, Dashboard and Presenter.',
      'endurance.status_title':'Endurance - Active Drivers / Stints',
      'endurance.active_driver':'Active driver',
      'endurance.stint':'Stint',
      'endurance.status':'Status',
      'endurance.car':'Car',
      'endurance.status_ok':'OK',
      'endurance.rule_violation':'Rule violation',
      'endurance.min_label':'min',
      'endurance.max_label':'max',
      'endurance.drop_remove':'Drop here to remove drivers from a team',
      'endurance.delete_title':'Delete team',
      'endurance.drop_here':'Drop drivers here...',
      'endurance.added':'Team added',
      'endurance.activated':'Endurance active',
      'endurance.activate_failed':'Activation failed',
      'endurance.deactivated':'Endurance deactivated',
      'endurance.name_saved':'Team name saved',
      'endurance.deleted':'Team deleted',
      'endurance.not_empty':'Team is not empty',
      'endurance.default_name':'Team {n}',
      'endurance.log_activated':'Endurance activated: {duration} min, minimum stint {minStint}, max stint {maxStint}, penalty {penalty}s, lap deduction from {threshold}s: {laps}'
    }
  };

  function now(){ return Date.now(); }
  function uid(p){ return p + '_' + Math.random().toString(16).slice(2,10); }
  function clamp(n,a,b){ n=Number(n); return Math.max(a, Math.min(b,n)); }
  function clampInt(v,minV,maxV){
    const n = parseInt(v,10);
    if(!Number.isFinite(n)) return minV;
    return Math.max(minV, Math.min(maxV, n));
  }
  function esc(s){ return String(s??'').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function getUiLanguage(){
    return state?.settings?.language === 'en' ? 'en' : 'de';
  }
  function getUiLocale(){
    return getUiLanguage() === 'en' ? 'en-US' : 'de-DE';
  }
  function t(key, vars=null, fallback=''){
    let out = I18N[getUiLanguage()]?.[key];
    if(out == null) out = I18N.de?.[key];
    if(out == null) out = fallback || key;
    out = String(out);
    if(vars && typeof vars === 'object'){
      for(const [name, value] of Object.entries(vars)){
        out = out.replaceAll(`{${name}}`, String(value ?? ''));
      }
    }
    return out;
  }

  function msToTime(ms, decimals=3){
    if(ms==null) return '—';
    const s = ms/1000;
    const m = Math.floor(s/60);
    const rem = s - m*60;
    const dp = Math.max(0, Math.min(3, decimals|0));
    const remStr = rem.toFixed(dp).padStart(2 + (dp?dp+1:0), '0');
    return m>0 ? `${m}:${remStr}` : remStr;
  }

function pickTextColorForBg(hex){
  if(!hex || typeof hex!=='string') return '#fff';
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if(!m) return '#fff';
  const v=m[1];
  const r=parseInt(v.slice(0,2),16)/255;
  const g=parseInt(v.slice(2,4),16)/255;
  const b=parseInt(v.slice(4,6),16)/255;
  const toLin=(c)=>(c<=0.03928)?c/12.92:((c+0.055)/1.055)**2.4;
  const L=0.2126*toLin(r)+0.7152*toLin(g)+0.0722*toLin(b);
  return L>0.5 ? '#000' : '#fff';
}



  function getRaceRelevantLaps(raceId){
    const all = state.session.laps.filter(l=>l && l.raceId===raceId && l.lapMs!=null);
    if(!all.length) return all;
    const raceOnly = all.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
    return raceOnly.length ? raceOnly : all;
  }

  function getCurrentMrcClock(){
    const clock = state.session?.mrcClock || {};
    if(!Number.isFinite(Number(clock.lastDeviceMs)) || !Number.isFinite(Number(clock.lastHostMs))) return null;
    return Math.max(0, Number(clock.lastDeviceMs) + (now() - Number(clock.lastHostMs)));
  }

  function updateMrcClock(deviceMs, source){
    const n = Number(deviceMs);
    if(!Number.isFinite(n) || n < 0) return null;
    state.session.mrcClock = state.session.mrcClock || { lastDeviceMs:null, lastHostMs:null, syncSeen:false };
    state.session.mrcClock.lastDeviceMs = n;
    state.session.mrcClock.lastHostMs = now();
    if(source==='sync') state.session.mrcClock.syncSeen = true;
    return n;
  }


  function getTimelineNowMs(){
    const mrcNow = getCurrentMrcClock();
    return Number.isFinite(Number(mrcNow)) ? Math.max(0, Number(mrcNow)) : 0;
  }

  function getRaceStartTs(raceId){
    const rd = getActiveRaceDay();
    const race = rd?.races?.find(r=>r.id===raceId) || null;
    return race?.startedAtMrc || state.session.startedAtMrc || 0;
  }

  function getDriverRaceTotalFromStartMs(raceId, driverId, lapsForRace=null){
    const laps = (lapsForRace || getRaceRelevantLaps(raceId)).filter(l=>{
      if(!l) return false;
      const car = l.carId ? getCar(l.carId) : null;
      const did = (l.driverId || car?.driverId || '').trim();
      return did===driverId;
    }).sort((a,b)=>a.ts-b.ts);

    if(!laps.length) return null;

    const raceStart = getRaceStartTs(raceId);
    const firstTs = laps[0].ts || raceStart || 0;
    const startOffset = Math.max(0, firstTs - raceStart);
    const lapSum = laps.reduce((s,l)=>s + (l.lapMs||0), 0);
    return startOffset + lapSum;
  }

  function getTeamRaceTotalFromStartMs(raceId, teamId, mode, lapsForRace=null){
    const teams = (mode==='team') ? (state.modes.team?.teams||[]) : (state.modes.endurance?.teams||[]);
    const team = teams.find(t=>t.id===teamId);
    if(!team) return null;

    const driverIds = (team.driverIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
    const carIds = new Set();
    driverIds.forEach(did=>{
      getCarsByDriver(did).forEach(c=>carIds.add(c.id));
    });

    const laps = (lapsForRace || getRaceRelevantLaps(raceId)).filter(l=>{
      if(!l) return false;
      if(l.carId && carIds.has(l.carId)) return true;
      return l.driverId && driverIds.includes(String(l.driverId));
    }).sort((a,b)=>a.ts-b.ts);

    if(!laps.length) return null;

    const raceStart = getRaceStartTs(raceId);
    const firstTs = laps[0].ts || raceStart || 0;
    const startOffset = Math.max(0, firstTs - raceStart);
    const lapSum = laps.reduce((s,l)=>s + (l.lapMs||0), 0);
    return startOffset + lapSum;
  }

  function getDriverAvatarDataUrl(driverId){
    const mediaUrl = (state.media && state.media.driverAvatars && state.media.driverAvatars[driverId]) || '';
    if(mediaUrl) return mediaUrl;
    const drv = getDriver(driverId);
    return String(drv?.photoDataUrl || drv?.avatarUrl || '').trim();
  }

  function getDriverLapSoundId(driverId){
    const d = getDriver(driverId);
    const own = String(d?.lapSoundAssetId || '').trim();
    if(own) return own;
    return String(state.audio?.defaultDriverSoundId || '').trim();
  }

  function getDriverLapSoundMeta(driverId){
    const id = getDriverLapSoundId(driverId);
    return id ? getAudioAssetMeta(id) : null;
  }

  // Finish window helpers (for 🏁 markers)
  let _finishCacheTs = 0;
  let _finishCacheDriverIds = new Set();

  function refreshFinishCache(){
    _finishCacheTs = now();
    const finish = (state.session.finish && state.session.finish.pending) ? state.session.finish : null;
    const set = new Set();
    if(finish && finish.finishedCarIds){
      for(const carId of Object.keys(finish.finishedCarIds)){
        const c = getCar(carId);
        const did = (c?.driverId||'').trim();
        if(did) set.add(did);
      }
    }
    _finishCacheDriverIds = set;
  }

  function isDriverFinished(driverId){
    if(!driverId) return false;
    if(!_finishCacheTs || (now() - _finishCacheTs) > 250){
      refreshFinishCache();
    }
    return _finishCacheDriverIds.has(driverId);
  }

  function resetRaceAnnounceRuntime(){
    state.session.announce = {
      restSaidKeys:{},
      timeExpiredSaid:false,
      runFinishedSaid:false,
      finishSaidByKey:{},
      placementsSaidForRaceId:'',
      lastOrderByRaceId:{},
      lappingSaidKeys:{}
    };
  }

  function ensureRaceAnnounceRuntime(){
    if(!state.session.announce) resetRaceAnnounceRuntime();
  }

  function speakRaceRemaining(totalSec){
    if(!state.audio?.enabled || !state.audio?.restAnnouncementsEnabled) return;
    totalSec = Math.max(0, Math.trunc(totalSec||0));
    if(totalSec<=0) return;

    const mins = Math.floor(totalSec/60);
    const secs = totalSec % 60;

    let text = 'Noch ';
    if(mins===1 && secs===0){
      text += 'eine Minute';
    } else {
      if(mins>0) text += mins + ' Minute' + (mins===1 ? '' : 'n');
      if(secs>0){
        if(mins>0) text += ' ';
        text += secs;
      }
    }
    if(state.audio?.sayPositionsAtRest && state.modes.activeMode==='single' && state.session.state==='RUNNING' && !isFreeDrivingMode()){
      const pos = buildCurrentRacePositionsSpeech(3);
      if(pos) text += ', ' + pos;
    }
    queueSpeak(text);
  }

  function getCurrentSingleRaceStandings(){
    const raceId = state.session.currentRaceId || '';
    if(!raceId) return [];
    const rd = getActiveRaceDay();
    const race = rd?.races?.find(r=>r.id===raceId) || null;
    if(!race || !['single','loop'].includes(String(race.mode||''))) return [];
    const laps = getRelevantRaceLaps(raceId, state.session.laps);
    return computeDriverStandingsGlobal(laps);
  }

  function buildCurrentRacePositionsSpeech(limit=3){
    const rows = getCurrentSingleRaceStandings().slice(0, limit);
    if(!rows.length) return '';
    const parts = rows.map((r, idx)=>{
      const ord = idx===0 ? 'Platz eins' : idx===1 ? 'Platz zwei' : idx===2 ? 'Platz drei' : ('Platz ' + (idx+1));
      const nm = getDriverSpeakName(r.id) || r.name || ('Fahrer ' + (idx+1));
      return ord + ' ' + nm;
    });
    return parts.join(', ');
  }

  function maybeAnnounceOvertakeAndLapping(lastCar){
    try{
      if(!state.audio?.enabled) return;
      if(state.session.state!=='RUNNING') return;
      if(isFreeDrivingMode()) return;
      const raceId = state.session.currentRaceId || '';
      if(!raceId) return;
      const race = getRaceById(raceId);
      if(!race || !['single','loop'].includes(String(race.mode||''))) return;
      if(race.mode==='loop' && currentPhase()!=='race') return;
      ensureRaceAnnounceRuntime();
      const rows = getCurrentSingleRaceStandings();
      if(!rows.length) return;
      const order = rows.map(r=>String(r.id));
      const prev = state.session.announce.lastOrderByRaceId?.[raceId] || [];
      if(state.audio.sayOvertakes && prev.length){
        const driverId = String(lastCar?.driverId || '');
        if(driverId){
          const newIdx = order.indexOf(driverId);
          const prevIdx = prev.indexOf(driverId);
          if(newIdx>=0 && prevIdx>=0 && newIdx < prevIdx){
            const overtakenId = prev[newIdx];
            if(overtakenId && overtakenId !== driverId){
              const a = (lastCar ? getSpeakNameForCar(lastCar) : '') || rows[newIdx]?.name || 'Fahrer';
              const b = getDriverSpeakName(overtakenId) || getDriver(overtakenId)?.name || rows.find(x=>String(x.id)===String(overtakenId))?.name || 'Fahrer';
              queueSpeak(a + ' hat ' + b + ' überholt');
            }
          }
        }
      }
      state.session.announce.lastOrderByRaceId[raceId] = order;

      if(state.audio.sayLappingWarning){
        const warnMs = Math.max(1, Number(state.audio.lappingWarnSec||3)) * 1000;
        const leaders = rows.slice(0, 3).filter(r=>r && Number.isFinite(r.lastTs));
        for(const leader of leaders){
          for(const r of rows){
            if(!r || String(r.id)===String(leader.id)) continue;
            if((leader.laps||0) === ((r.laps||0) + 1) && Number.isFinite(r.lastTs) && leader.lastTs >= r.lastTs){
              const delta = leader.lastTs - r.lastTs;
              if(delta <= warnMs){
                const key = raceId + ':' + String(leader.id) + ':' + String(r.id) + ':' + String(leader.laps||0);
                if(!state.session.announce.lappingSaidKeys[key]){
                  const name = getDriverSpeakName(r.id) || r.name || 'Fahrer';
                  const leaderName = getDriverSpeakName(leader.id) || leader.name || 'Fahrer';
                  queueSpeak('Achtung, ' + name + ' wird von ' + leaderName + ' überrundet');
                  state.session.announce.lappingSaidKeys[key] = true;
                }
              }
            }
          }
        }
      }
    }catch{}
  }

  
  function getSpeakNameForCar(car){
    if(!car) return '';
    const did = car.driverId;
    const phon = did ? getDriverSpeakName(did) : '';
    return (phon || getDriverNameForCar(car) || car.name || '').trim();
  }

function getFinishNameForCarId(carId){
    const car = getCar(carId);
    if(!car) return '';
    return getSpeakNameForCar(car);
  }

  function getPlacementsForRace(raceId){
    if(!raceId) return [];
    const rd = getActiveRaceDay();
    const race = rd?.races?.find(r=>r.id===raceId) || null;
    if(!race) return [];
    const laps = getRelevantRaceLaps(raceId, state.session.laps);
    if(race.mode==='team' || race.mode==='endurance'){
      return computeTeamStandingsGlobal(laps, race.mode, null).map((t,idx)=>({ pos:idx+1, name:t.name||('Team '+(idx+1)), speakName:t.name||('Team '+(idx+1)) }));
    }
    return computeDriverStandingsGlobal(laps).map((s,idx)=>({ pos:idx+1, name:s.name||('Fahrer '+(idx+1)), speakName: (getDriverSpeakName(s.id) || s.name || ('Fahrer '+(idx+1))) }));
  }

  function speakPlacementsForRace(raceId){
    if(!state.audio?.enabled || !state.audio?.sayPlacements) return;
    ensureRaceAnnounceRuntime();
    if(state.session.announce.placementsSaidForRaceId===raceId) return;

    const placements = getPlacementsForRace(raceId).slice(0,5);
    if(!placements.length) return;

    const parts = placements.map(p=>{
      const ord = p.pos===1 ? 'Platz eins' : p.pos===2 ? 'Platz zwei' : p.pos===3 ? 'Platz drei' : ('Platz ' + p.pos);
      return ord + ' ' + (p.speakName||p.name);
    });

    queueSpeak(parts.join(', '));
    state.session.announce.placementsSaidForRaceId = raceId;
    saveState();
  }

  function loadImageFromUrl(url){
    return new Promise((resolve)=>{
      try{
        const src = String(url||'').trim();
        if(!src){ resolve(null); return; }
        const img = new Image();
        img.onload = ()=>resolve(img);
        img.onerror = ()=>resolve(null);
        img.src = src;
      }catch(_e){
        resolve(null);
      }
    });
  }

  async function fileToSquareAvatarDataUrl(file, size=512){
    // Read file → center-crop square → resize → encode
    const dataUrl = await new Promise((res, rej)=>{
      const r = new FileReader();
      r.onerror = ()=>rej(new Error('read_failed'));
      r.onload = ()=>res(String(r.result||''));
      r.readAsDataURL(file);
    });
    const img = await new Promise((res, rej)=>{
      const i = new Image();
      i.onload = ()=>res(i);
      i.onerror = ()=>rej(new Error('img_failed'));
      i.src = dataUrl;
    });

    const s = Math.min(img.naturalWidth||img.width, img.naturalHeight||img.height);
    const sx = Math.floor(((img.naturalWidth||img.width) - s) / 2);
    const sy = Math.floor(((img.naturalHeight||img.height) - s) / 2);

    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0,0,size,size);
    ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

    // Prefer webp, fallback png
    let out = '';
    try{
      out = canvas.toDataURL('image/webp', 0.85);
      if(!out || !out.startsWith('data:image/webp')) throw new Error('no_webp');
    }catch(e){
      out = canvas.toDataURL('image/png');
    }
    return out;
  }

  async function setDriverAvatar(driverId, file){
    if(!driverId) return;
    if(!file) return;
    const okTypes = ['image/jpeg','image/png','image/webp','image/heic','image/heif'];
    if(file.type && !okTypes.includes(file.type)){
      toast('⚠️ Bitte JPG/PNG/WebP auswählen.');
      return;
    }
    try{
      const dataUrl = await fileToSquareAvatarDataUrl(file, 512);
      state.media.driverAvatars[driverId] = dataUrl;
      saveState();
      toast('✅ Fahrerbild gespeichert');
      renderStammdaten();
      renderDashboard();
    }catch(e){
      toast('⚠️ Bild konnte nicht gelesen werden (evtl. HEIC). Tipp: über ChatGPT als JPG/WebP speichern.');
    }
  }

  function removeDriverAvatar(driverId){
    if(state.media && state.media.driverAvatars){
      delete state.media.driverAvatars[driverId];
      saveState();
      toast('🗑️ Fahrerbild entfernt');
      renderStammdaten();
      renderDashboard();
    }

  }

    function initials(name){
    const parts = String(name||'').trim().split(/\s+/).filter(Boolean);
    if(!parts.length) return '?';
    const a = parts[0][0]||'?';
    const b = (parts.length>1 ? parts[parts.length-1][0] : '') || '';
    return (a+b).toUpperCase();
  }

  function renderDriverChip(driver, ctx='pool', teamId=''){
    const avatar = getDriverAvatarDataUrl(driver.id);
    const ini = initials(driver.name);
    const removeBtn = (ctx==='team') ? `<button class="chip-x" type="button" title="Aus Team entfernen" data-remove-from-team="${esc(driver.id)}">✕</button>` : '';
    return `
      <div class="driver-chip" draggable="true" data-driver-id="${esc(driver.id)}">
        <div class="avatar-sm">${avatar?'<img src="'+avatar+'" alt=""/>' : '<span>'+esc(ini)+'</span>'}</div>
        <div class="chip-name">${esc(driver.name||'Unbenannt')}</div>
        ${removeBtn}
      </div>
    `;
  }

  
  function getTeamForDriverInMode(mode, driverId){
    const teams = getTeamsForMode(mode) || [];
    return teams.find(t => (t.driverIds||[]).includes(driverId)) || null;
  }

  function getEnduranceActiveInfo(teamId){
    return (state.modes.endurance?.activeByTeamId||{})[teamId] || null;
  }

  function setEnduranceActiveInfo(teamId, info){
    if(!state.modes.endurance.activeByTeamId || typeof state.modes.endurance.activeByTeamId!=='object'){
      state.modes.endurance.activeByTeamId = {};
    }
    state.modes.endurance.activeByTeamId[teamId] = info;
  }

  function clearEnduranceActiveInfos(){
    if(!state.modes.endurance) return;
    state.modes.endurance.activeByTeamId = {};
  }

  function ensureEnduranceStintStore(){
    if(!state.modes.endurance || typeof state.modes.endurance!=='object') state.modes.endurance = defaultState().modes.endurance;
    if(!state.modes.endurance.stintHistoryByRace || typeof state.modes.endurance.stintHistoryByRace!=='object') state.modes.endurance.stintHistoryByRace = {};
    return state.modes.endurance.stintHistoryByRace;
  }

  function getEnduranceStintsForRaceTeam(raceId, teamId){
    if(!raceId || !teamId) return [];
    const store = ensureEnduranceStintStore();
    const byRace = store[raceId] || {};
    const arr = byRace[teamId];
    return Array.isArray(arr) ? arr : [];
  }

  function setEnduranceStintsForRaceTeam(raceId, teamId, stints){
    if(!raceId || !teamId) return;
    const store = ensureEnduranceStintStore();
    if(!store[raceId] || typeof store[raceId] !== 'object') store[raceId] = {};
    store[raceId][teamId] = Array.isArray(stints) ? stints : [];
  }

  function clearEnduranceStintsForRace(raceId){
    if(!raceId) return;
    const store = ensureEnduranceStintStore();
    delete store[raceId];
  }

  function finalizeEnduranceStint(teamId, raceId, endTs){
    if(!teamId || !raceId) return null;
    const ai = getEnduranceActiveInfo(teamId);
    if(!ai) return null;
    const arr = getEnduranceStintsForRaceTeam(raceId, teamId).slice();
    const stint = {
      driverId: String(ai.driverId||'').trim(),
      carId: String(ai.carId||'').trim(),
      startTs: Number(ai.activatedTs||0) || 0,
      endTs: Number(endTs||now()) || now(),
      lapCount: Math.max(0, parseInt(ai.stintLaps||0,10) || 0)
    };
    arr.push(stint);
    setEnduranceStintsForRaceTeam(raceId, teamId, arr);
    return stint;
  }

  function finalizeAllEnduranceStintsForRace(raceId, endTs){
    if(!raceId) return;
    const teams = state.modes.endurance?.teams || [];
    teams.forEach(t=>{
      const ai = getEnduranceActiveInfo(t.id);
      if(ai) finalizeEnduranceStint(t.id, raceId, endTs);
    });
  }

  function getEnduranceRuleStateForTeam(teamId, raceId){
    const race = raceId ? getRaceById(raceId) : null;
    const minStint = Math.max(0, parseInt((race?.enduranceMinStintLaps ?? state.modes.endurance?.minStintLaps ?? 0),10) || 0);
    const maxStint = Math.max(0, parseInt((race?.enduranceMaxStintLaps ?? state.modes.endurance?.maxStintLaps ?? 0),10) || 0);
    const penaltySecondsPerViolation = Math.max(0, parseInt((race?.endurancePenaltySecondsPerViolation ?? state.modes.endurance?.penaltySecondsPerViolation ?? 0),10) || 0);
    const penaltyLapThresholdSeconds = Math.max(0, parseInt((race?.endurancePenaltyLapThresholdSeconds ?? state.modes.endurance?.penaltyLapThresholdSeconds ?? 0),10) || 0);
    const penaltyLapsPerThreshold = Math.max(0, parseInt((race?.endurancePenaltyLapsPerThreshold ?? state.modes.endurance?.penaltyLapsPerThreshold ?? 1),10) || 0);
    let stints = getEnduranceStintsForRaceTeam(raceId, teamId).slice();
    const ai = getEnduranceActiveInfo(teamId);
    if(ai && raceId && raceId === (state.session.currentRaceId||'')){
      stints.push({
        driverId: String(ai.driverId||'').trim(),
        carId: String(ai.carId||'').trim(),
        startTs: Number(ai.activatedTs||0) || 0,
        endTs: null,
        lapCount: Math.max(0, parseInt(ai.stintLaps||0,10) || 0),
        live: true
      });
    }
    const tooShort = minStint>0 ? stints.filter(st => Number(st.lapCount||0) < minStint) : [];
    const tooLong = maxStint>0 ? stints.filter(st => Number(st.lapCount||0) > maxStint) : [];
    const violations = [...tooShort, ...tooLong];
    const penaltySecondsTotal = violations.length * penaltySecondsPerViolation;
    const projectedDeductedLaps = (penaltyLapThresholdSeconds>0 && penaltyLapsPerThreshold>0)
      ? (Math.floor(penaltySecondsTotal / penaltyLapThresholdSeconds) * penaltyLapsPerThreshold)
      : 0;
    const deductedLaps = race?.endedAt ? projectedDeductedLaps : 0;
    let statusText = 'OK';
    if(false && tooShort.length && tooLong.length) statusText = `AW • Stint außerhalb ${minStint}-${maxStint} Runden`;
    else if(false && tooShort.length) statusText = 'AW • Stint < ' + minStint + ' Runden';
    else if(false && tooLong.length) statusText = 'AW • Stint > ' + maxStint + ' Runden';
    if(violations.length){
      const reasons = [];
      if(tooShort.length) reasons.push((tooShort.length===1 ? 'Stint' : (tooShort.length+'x Stint')) + ' < ' + minStint + ' Runden');
      if(tooLong.length) reasons.push((tooLong.length===1 ? 'Stint' : (tooLong.length+'x Stint')) + ' > ' + maxStint + ' Runden');
      const penalties = [];
      if(penaltySecondsTotal>0) penalties.push('+' + penaltySecondsTotal + 's');
      if(projectedDeductedLaps>0) penalties.push((race?.endedAt ? '-' : 'nach Rennen -') + projectedDeductedLaps + ' Runde' + (projectedDeductedLaps===1 ? '' : 'n'));
      statusText = 'Regelverstoss - ' + reasons.join(' - ') + (penalties.length ? ' - ' + penalties.join(' - ') : '');
    }
    return {
      minStint,
      maxStint,
      penaltySecondsPerViolation,
      penaltySecondsTotal,
      penaltyLapThresholdSeconds,
      penaltyLapsPerThreshold,
      projectedDeductedLaps,
      deductedLaps,
      stints,
      tooShort,
      tooLong,
      violations,
      compliant: violations.length===0,
      invalidStintCount: violations.length,
      statusText
    };
  }

  function countEnduranceStintLapsForDriver(teamId, driverId, raceId){
    const ai = getEnduranceActiveInfo(teamId);
    if(ai && String(ai.driverId||'').trim()===String(driverId||'').trim() && raceId === (state.session.currentRaceId||'')){
      return Math.max(0, parseInt(ai.stintLaps||0,10) || 0);
    }
    const stints = getEnduranceStintsForRaceTeam(raceId, teamId);
    for(let i=stints.length-1;i>=0;i--){
      if(String(stints[i].driverId||'').trim()===String(driverId||'').trim()) return Math.max(0, parseInt(stints[i].lapCount||0,10) || 0);
    }
    return 0;
  }

function getTeamsForMode(mode){
    if(mode==='endurance') return state.modes.endurance.teams;
    return state.modes.team.teams;
  }

  function setTeamsForMode(mode, teams){
    if(mode==='endurance') state.modes.endurance.teams = teams;
    else state.modes.team.teams = teams;
  }

  function unassignDriverFromTeams(mode, driverId){
    if(!driverId) return;
    const teams = getTeamsForMode(mode).map(t=>({ ...t, driverIds:(t.driverIds||[]).filter(id=>id!==driverId) }));
    setTeamsForMode(mode, teams);
    saveState();
    toast('✅ Fahrer entfernt');
  }

  function assignDriverToTeam(mode, driverId, teamId){
    if(!driverId || !teamId) return;
    let teams = getTeamsForMode(mode).map(t=>({ ...t, driverIds:(t.driverIds||[]).filter(id=>id!==driverId) }));
    const t = teams.find(x=>x.id===teamId);
    if(!t){ toast('⚠️ Team nicht gefunden'); return; }
    if(!(t.driverIds||[]).includes(driverId)) t.driverIds = [...(t.driverIds||[]), driverId];
    setTeamsForMode(mode, teams);
    saveState();
    const tn = (t.name||'Team');
    toast(`✅ Fahrer zu ${tn}`);
  }

  function msToSpeechTime(ms, decimals){
    // Speak like: 7.123s -> "7 komma 1 2 3" (no "Sekunden" word)
    // If minutes exist: "1 Minute 5 komma 0 4 2"
    ms = Math.max(0, ms|0);
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);

    const dp = Math.max(0, Math.min(3, decimals|0));
    let fracSpoken = '';
    if(dp > 0){
      const fracUnit = 10 ** (3-dp); // dp=3 ->1, dp=2->10, dp=1->100
      const frac = Math.floor((ms % 1000) / fracUnit);
      const s = String(frac).padStart(dp,'0');
      fracSpoken = s.split('').join(' ');
    }

    // Main number part
    let base = '';
    if(mins > 0){
      base = mins + ' ' + (mins===1 ? 'Minute' : 'Minuten') + ' ' + secs;
    } else {
      base = String(secs);
    }

    if(dp > 0){
      return base + ' komma ' + fracSpoken;
    }
    return base;
  }

  function defaultState(){
    const year = new Date().getFullYear();
    const seasonId = uid('season');
    const trackId = uid('track');
    const raceDayId = uid('raceday');
    return {
      ui:{
        activeTab:'Dashboard',
        selectedRaceId:'',
        selectedRaceDriverId:'',
        dashboardView:'auto',
        dashboardSort:'best',
        dashboardShowLiveFallback:true,
        stammdatenSelectedDriverId:'',
        stammdatenDriverQuery:'',
        stammdatenCarQuery:'',
        teamAssignQuery:'',
        endAssignQuery:'',
        podiumRaceId:'',
        freeDrivingEnabled:false,
        audioSelectedId:'',
        audioFilterCategory:'',
        audioSearch:''
      },
      settings:{ appName:'Zeitnahme 2.0', language:'de', baudRate:19200, discordWebhook:'', discordAutoSend:false, discordUseThread:false, discordThreadName:'', discordRaceDayWebhook:'', discordSeasonWebhook:'', discordRaceDayUseThread:false, discordSeasonUseThread:false, discordRaceDayThreadName:'{type} • {date}', discordSeasonThreadName:'{type} • {season}', dbPlaceholder:'', useAmpel:true, scaleDenominator:50, ampelWaitMs:1200, ampelStepMs:700, allowIdleReads:false, lapTimeSource:'mrc' },
      media:{ driverAvatars:{} },
      personalRecords:{ bySeason:{}, byRaceDay:{} },
      usb:{ connected:false, available:false, info:'', lastError:'', lastLines:[] },
      ble:{ connected:false, available:('bluetooth' in navigator), info:'', lastError:'', lastLines:[], notify:false, knownDeviceId:'', knownDeviceName:'', autoReconnect:true },
      season:{ seasons:[{id:seasonId,name:'Saison '+year,status:'active',createdAt:now(),endedAt:null}], activeSeasonId:seasonId },
      tracks:{ tracks:[{id:trackId,name:'Standard Strecke',minLapMs:3000,setup:{mode:'Schnell',tireWear:'Aus',boost:false},recordsBySeason:{[seasonId]:{ms:null,driverName:'',carName:''}}}], activeTrackId:trackId },
      raceDay:{ raceDays:[{id:raceDayId,name:'Renntag '+new Date().toLocaleDateString('de-DE'),seasonId,trackId,createdAt:now(),races:[], trackRecordsByTrackId:{}}], activeRaceDayId:raceDayId },
      masterData:{ drivers:[], cars:[] },
      modes:{
        activeMode:null, // 'single'|'team'|'loop'|'endurance'
        singleSubmode:'Training',
        single:{ finishMode:'time', timeLimitSec:180, lapLimit:20 },
        team:{ finishMode:'time', timeLimitSec:180, lapLimit:20, pointsScheme:'10,8,6,5,4,3,2,1', selectedDriverIds:[], teams:[{id:uid(), name:'Team 1', driverIds:[]},{id:uid(), name:'Team 2', driverIds:[]}] },
        loop:{ trainingSec:60, raceSec:120 },
        endurance:{ durationMin:30, lapsLimit:0, minStintLaps:5, maxStintLaps:0, penaltySecondsPerViolation:0, penaltyLapThresholdSeconds:0, penaltyLapsPerThreshold:1, activeByTeamId:{}, stintHistoryByRace:{}, teams:[{id:uid(), name:'Team 1', driverIds:[]},{id:uid(), name:'Team 2', driverIds:[]}] }
      },
      session:{
        state:'IDLE', startedAt:null, startedAtMrc:null, pausedAt:null, pausedAtMrc:null, pauseAccumMs:0, pauseAccumMrcMs:0,
        currentRaceId:null,
        isFreeDriving:false,
        lastPassByCarId:{},
        ignoreNextLapByCarId:{},
        idleLastPassByCarId:{},
        idleLaps:[],
        laps:[],
        mrcClock:{ lastDeviceMs:null, lastHostMs:null, syncSeen:false }
      },
      loopRuntime:{ phase:null, phaseEndsAt:null, remainingMs:null, phaseStartedAt:null, phaseElapsedMs:0 },
      audio:{
        enabled:true,
        lapAnnounceMode:'Jede Runde', // Aus|Jede Runde|Nur Bestzeit
        sayName:true, sayLapNo:true, sayLapTime:true,
        decimals:3,
        voiceUri:'',
        rate:1.0, pitch:1.0, volume:1.0,
        targetDb:-16,
        defaultDriverSoundId:'',
        driverSoundOnlyOnBestMode:true,
        sayOvertakes:true,
        sayLappingWarning:true,
        lappingWarnSec:3,
        sayPositionsAtRest:true,
        library:[]
      }
    };
  }

  function deepMerge(a,b){
    if(Array.isArray(a) || Array.isArray(b)) return (b ?? a);
    if(a && b && typeof a==='object' && typeof b==='object'){
      const out = {...a};
      for(const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
      return out;
    }
    return (b ?? a);
  }

  function ensureAutoEntities(s){
    if(typeof s.settings?.allowIdleReads !== 'boolean') s.settings.allowIdleReads = false;
    s.settings.lapTimeSource = 'mrc';
    if(typeof s.ui?.freeDrivingEnabled !== 'boolean') s.ui.freeDrivingEnabled = false;
    if(typeof s.session?.isFreeDriving !== 'boolean') s.session.isFreeDriving = false;
    if(!s.session) s.session = {};
    if(s.session.startedAtMrc==null) s.session.startedAtMrc = null;
    if(s.session.pausedAtMrc==null) s.session.pausedAtMrc = null;
    if(!Number.isFinite(Number(s.session.pauseAccumMrcMs))) s.session.pauseAccumMrcMs = 0;
    if(!s.session.mrcClock || typeof s.session.mrcClock!=='object') s.session.mrcClock = { lastDeviceMs:null, lastHostMs:null, syncSeen:false };
    if(!Number.isFinite(Number(s.session.mrcClock.lastDeviceMs))) s.session.mrcClock.lastDeviceMs = null;
    if(!Number.isFinite(Number(s.session.mrcClock.lastHostMs))) s.session.mrcClock.lastHostMs = null;
    if(typeof s.session.mrcClock.syncSeen !== 'boolean') s.session.mrcClock.syncSeen = false;
    if(typeof s.audio?.sayOvertakes !== 'boolean') s.audio.sayOvertakes = true;
    if(typeof s.audio?.sayLappingWarning !== 'boolean') s.audio.sayLappingWarning = true;
    if(typeof s.audio?.sayPositionsAtRest !== 'boolean') s.audio.sayPositionsAtRest = true;
    if(!Number.isFinite(Number(s.audio?.lappingWarnSec))) s.audio.lappingWarnSec = 3;
    // season
    if(!s.season?.seasons?.length){
      const year = new Date().getFullYear();
      const id = uid('season');
      s.season = { seasons:[{id,name:'Saison '+year,status:'active',createdAt:now(),endedAt:null}], activeSeasonId:id };
    }
    if(!s.season.activeSeasonId) s.season.activeSeasonId = s.season.seasons.find(x=>x.status==='active')?.id || s.season.seasons[0].id;

    // tracks
    if(!s.tracks?.tracks?.length){
      const id = uid('track');
      s.tracks = { tracks:[{id,name:'Standard Strecke',minLapMs:3000,setup:{mode:'Schnell',tireWear:'Aus',boost:false},recordsBySeason:{[seasonId]:{ms:null,driverName:'',carName:''}}}], activeTrackId:id };
    }
    if(!s.tracks.activeTrackId) s.tracks.activeTrackId = s.tracks.tracks[0].id;
    s.tracks.tracks.forEach(t=>{
      if(!t.setup) t.setup = {mode:'Schnell', tireWear:'Aus', boost:false};
      if(!Number.isFinite(Number(t.displayLengthMeters))) t.displayLengthMeters = Number(t.displayLength)||0;
      if(!Number.isFinite(Number(t.lengthMeters))) t.lengthMeters = t.displayLengthMeters;
      if(!Number.isFinite(Number(t.trackLengthMeters))) t.trackLengthMeters = t.displayLengthMeters;
    });

    // race day
    if(!s.raceDay?.raceDays?.length){
      const id = uid('raceday');
      s.raceDay = { raceDays:[{id,name:'Renntag '+new Date().toLocaleDateString('de-DE'),seasonId:s.season.activeSeasonId,trackId:s.tracks.activeTrackId,createdAt:now(),races:[], trackRecordsByTrackId:{}}], activeRaceDayId:id };
    }
    if(!s.raceDay.activeRaceDayId) s.raceDay.activeRaceDayId = s.raceDay.raceDays[0].id;

    for(const rd of s.raceDay.raceDays){
      if(!Array.isArray(rd.races)) rd.races = [];
      if(!rd.trackRecordsByTrackId || typeof rd.trackRecordsByTrackId!=='object') rd.trackRecordsByTrackId = {};
    }
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if(!raw) return defaultState();
      const parsed = JSON.parse(raw);
      const merged = deepMerge(defaultState(), parsed);
      ensureAutoEntities(merged);
      // Migration/Defaults
      if(!merged.audio) merged.audio = defaultState().audio;
      if(typeof merged.audio.decimals!=='number' || !Number.isFinite(merged.audio.decimals)) merged.audio.decimals = 3;
      merged.audio.decimals = Math.max(0, Math.min(3, Math.trunc(merged.audio.decimals)));
      if(typeof merged.audio.restAnnouncementsEnabled!=='boolean') merged.audio.restAnnouncementsEnabled = true;
      if(!Array.isArray(merged.audio.restAnnouncementTimes)) merged.audio.restAnnouncementTimes = [300,180,120,60,30];
      merged.audio.restAnnouncementTimes = merged.audio.restAnnouncementTimes.map(x=>parseInt(x,10)).filter(x=>Number.isFinite(x) && x>0).sort((a,b)=>b-a);
      if(typeof merged.audio.sayTimeExpired!=='boolean') merged.audio.sayTimeExpired = true;
      if(typeof merged.audio.sayFinished!=='boolean') merged.audio.sayFinished = true;
      if(typeof merged.audio.sayRunFinished!=='boolean') merged.audio.sayRunFinished = true;
      if(typeof merged.audio.sayPlacements!=='boolean') merged.audio.sayPlacements = true;
      if(typeof merged.audio.sayTrackRecordSeason!=='boolean') merged.audio.sayTrackRecordSeason = true;
      if(typeof merged.audio.sayTrackRecordDay!=='boolean') merged.audio.sayTrackRecordDay = true;
      if(!merged.modes.team) merged.modes.team = { finishMode:'time', timeLimitSec:180, lapLimit:20, selectedDriverIds:[], teams:[] };
      if(!merged.modes.team.finishMode) merged.modes.team.finishMode = 'time';
      if(!Number.isFinite(Number(merged.modes.team.timeLimitSec))) merged.modes.team.timeLimitSec = 180;
      if(!Number.isFinite(Number(merged.modes.team.lapLimit))) merged.modes.team.lapLimit = 20;
      if(!merged.modes.team.pointsScheme) merged.modes.team.pointsScheme = '10,8,6,5,4,3,2,1';
      if(!merged.modes.endurance) merged.modes.endurance = { durationMin:30, lapsLimit:0, minStintLaps:5, maxStintLaps:0, penaltySecondsPerViolation:0, penaltyLapThresholdSeconds:0, penaltyLapsPerThreshold:1, activeByTeamId:{}, stintHistoryByRace:{}, teams:[] };
      if(!Number.isFinite(Number(merged.modes.endurance.maxStintLaps))) merged.modes.endurance.maxStintLaps = 0;
      if(!Number.isFinite(Number(merged.modes.endurance.minStintLaps))) merged.modes.endurance.minStintLaps = 5;
      if(!Number.isFinite(Number(merged.modes.endurance.penaltySecondsPerViolation))) merged.modes.endurance.penaltySecondsPerViolation = 0;
      if(!Number.isFinite(Number(merged.modes.endurance.penaltyLapThresholdSeconds))) merged.modes.endurance.penaltyLapThresholdSeconds = 0;
      if(!Number.isFinite(Number(merged.modes.endurance.penaltyLapsPerThreshold))) merged.modes.endurance.penaltyLapsPerThreshold = 1;
      if(!merged.modes.endurance.activeByTeamId || typeof merged.modes.endurance.activeByTeamId!=='object') merged.modes.endurance.activeByTeamId = {};
      if(!merged.modes.endurance.stintHistoryByRace || typeof merged.modes.endurance.stintHistoryByRace!=='object') merged.modes.endurance.stintHistoryByRace = {};
      if(typeof merged.audio.sayPersonalBestSeason!=='boolean') merged.audio.sayPersonalBestSeason = true;
      if(typeof merged.audio.sayPersonalBestDay!=='boolean') merged.audio.sayPersonalBestDay = true;
      if(!Array.isArray(merged.audio.library)) merged.audio.library = [];
      if(typeof merged.audio.targetDb!=='number' || !Number.isFinite(merged.audio.targetDb)) merged.audio.targetDb = -16;
      if(typeof merged.audio.defaultDriverSoundId!=='string') merged.audio.defaultDriverSoundId = '';
      if(typeof merged.audio.driverSoundOnlyOnBestMode!=='boolean') merged.audio.driverSoundOnlyOnBestMode = true;
      if(typeof merged.ui.audioSelectedId!=='string') merged.ui.audioSelectedId = '';
      if(typeof merged.ui.audioFilterCategory!=='string') merged.ui.audioFilterCategory = '';
      if(typeof merged.ui.audioSearch!=='string') merged.ui.audioSearch = '';
      if(typeof merged.settings?.discordAutoSend!=='boolean') merged.settings.discordAutoSend = false;
      if(typeof merged.settings?.language!=='string') merged.settings.language = 'de';
      if(typeof merged.settings?.discordUseThread!=='boolean') merged.settings.discordUseThread = false;
      if(typeof merged.settings?.discordThreadName!=='string') merged.settings.discordThreadName = '';
      if(typeof merged.settings?.discordRaceDayWebhook!=='string') merged.settings.discordRaceDayWebhook = '';
      if(typeof merged.settings?.discordSeasonWebhook!=='string') merged.settings.discordSeasonWebhook = '';
      if(typeof merged.settings?.discordRaceDayUseThread!=='boolean') merged.settings.discordRaceDayUseThread = false;
      if(typeof merged.settings?.discordSeasonUseThread!=='boolean') merged.settings.discordSeasonUseThread = false;
      if(typeof merged.settings?.discordRaceDayThreadName!=='string') merged.settings.discordRaceDayThreadName = '{type} • {date}';
      if(typeof merged.settings?.discordSeasonThreadName!=='string') merged.settings.discordSeasonThreadName = '{type} • {season}';
      if(!merged.media) merged.media = { driverAvatars:{} };
      if(!merged.media.driverAvatars) merged.media.driverAvatars = {};
      if(!merged.modes?.team?.teams) merged.modes.team.teams = defaultState().modes.team.teams;
      if(!merged.modes?.endurance?.teams) merged.modes.endurance.teams = defaultState().modes.endurance.teams;
      if(!merged.modes?.single) merged.modes.single = defaultState().modes.single;
      if(!merged.modes.single.finishMode) merged.modes.single.finishMode = defaultState().modes.single.finishMode;
      if(typeof merged.modes.single.timeLimitSec!=='number') merged.modes.single.timeLimitSec = defaultState().modes.single.timeLimitSec;
      if(typeof merged.modes.single.lapLimit!=='number') merged.modes.single.lapLimit = defaultState().modes.single.lapLimit;
      if(typeof merged.ble?.knownDeviceId!=='string') merged.ble.knownDeviceId = '';
      if(typeof merged.ble?.knownDeviceName!=='string') merged.ble.knownDeviceName = '';
      if(typeof merged.ble?.autoReconnect!=='boolean') merged.ble.autoReconnect = true;
      // Nach Reload niemals einen alten Verbindungsstatus weitertragen.
      merged.ble.connected = false;
      merged.ble.notify = false;
      merged.ble.lastError = '';
      if(typeof merged.ble?.info !== 'string') merged.ble.info = '';

      
      // Migration: Dauerschleife Minuten-Settings (falls alte Sekunden vorhanden)
      if(!merged.modes.loop) merged.modes.loop = {};
      const dLoop = defaultState().modes.loop;
      if(typeof merged.modes.loop.trainingMin!=='number'){
        if(typeof merged.modes.loop.trainingSec==='number') merged.modes.loop.trainingMin = Math.max(0, merged.modes.loop.trainingSec/60);
        else merged.modes.loop.trainingMin = dLoop.trainingMin;
      }
      if(typeof merged.modes.loop.setupMin!=='number') merged.modes.loop.setupMin = dLoop.setupMin;
      if(typeof merged.modes.loop.raceMin!=='number'){
        if(typeof merged.modes.loop.raceSec==='number') merged.modes.loop.raceMin = Math.max(0, merged.modes.loop.raceSec/60);
        else merged.modes.loop.raceMin = dLoop.raceMin;
      }
      if(typeof merged.modes.loop.podiumMin!=='number') merged.modes.loop.podiumMin = dLoop.podiumMin;
// Migration: season-basierte Streckenrekorde
      const sid = merged?.season?.activeSeasonId || (merged.season && merged.season.seasons && merged.season.seasons[0]?.id) || null;
      if(merged.tracks && Array.isArray(merged.tracks.tracks)){
        merged.tracks.tracks.forEach(t=>{
          if(!t) return;
          if(!t.recordsBySeason) t.recordsBySeason = {};
          // alte Struktur "record" migrieren
          if(t.record && sid && !t.recordsBySeason[sid]){
            t.recordsBySeason[sid] = { ms: t.record.ms ?? null, driverName: t.record.driverName || '', carName: t.record.carName || '' };
          }
          // record entfernen lassen wir drin für Rückwärts-Kompatibilität, wird aber nicht mehr genutzt
        });
      }
      
      if(!merged.personalRecords || typeof merged.personalRecords!=='object') merged.personalRecords = {bySeason:{}, byRaceDay:{}};
      if(!merged.personalRecords.bySeason) merged.personalRecords.bySeason = {};
      if(!merged.personalRecords.byRaceDay) merged.personalRecords.byRaceDay = {};
      if(!merged.masterData) merged.masterData = {drivers:[], cars:[]};
      if(!Array.isArray(merged.masterData.drivers)) merged.masterData.drivers = [];
      if(!Array.isArray(merged.masterData.cars)) merged.masterData.cars = [];
return merged;
    }catch{
      return defaultState();
    }
  }

  let state = loadState();
  ensureAutoEntities(state);

  let _appDataDbPromise = null;
  let _appDataPersistTimer = null;
  let _appDataPersistInFlight = null;
  let _appDataHydrated = false;

  function idbRequestToPromise(req){
    return new Promise((resolve, reject)=>{
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('IndexedDB request failed'));
    });
  }

  function getAppDataDb(){
    if(_appDataDbPromise) return _appDataDbPromise;
    _appDataDbPromise = new Promise((resolve, reject)=>{
      try{
        const req = indexedDB.open(APP_DATA_DB_NAME, APP_DATA_DB_VERSION);
        req.onupgradeneeded = ()=>{
          const db = req.result;
          if(!db.objectStoreNames.contains(APP_DATA_AVATAR_STORE)) db.createObjectStore(APP_DATA_AVATAR_STORE, { keyPath:'driverId' });
          if(!db.objectStoreNames.contains(APP_DATA_SESSION_LAPS_STORE)) db.createObjectStore(APP_DATA_SESSION_LAPS_STORE, { keyPath:'id' });
          if(!db.objectStoreNames.contains(APP_DATA_IDLE_LAPS_STORE)) db.createObjectStore(APP_DATA_IDLE_LAPS_STORE, { keyPath:'id' });
          if(!db.objectStoreNames.contains(APP_DATA_STATE_CHUNK_STORE)) db.createObjectStore(APP_DATA_STATE_CHUNK_STORE, { keyPath:'chunkKey' });
          if(!db.objectStoreNames.contains(APP_DATA_DISCORD_QUEUE_STORE)) db.createObjectStore(APP_DATA_DISCORD_QUEUE_STORE, { keyPath:'id' });
        };
        req.onsuccess = ()=>resolve(req.result);
        req.onerror = ()=>reject(req.error || new Error('IndexedDB open failed'));
      }catch(err){
        reject(err);
      }
    });
    return _appDataDbPromise;
  }

  function buildExternalAppDataSnapshot(srcState=state){
    return {
      driverAvatars: { ...((srcState.media && srcState.media.driverAvatars) || {}) },
      laps: Array.isArray(srcState.session?.laps) ? srcState.session.laps.map(l=>({ ...l })) : [],
      idleLaps: Array.isArray(srcState.session?.idleLaps) ? srcState.session.idleLaps.map(l=>({ ...l })) : []
    };
  }

  function buildExternalStateChunkSnapshot(srcState=state){
    return {
      masterData: JSON.parse(JSON.stringify(srcState.masterData || { drivers:[], cars:[] })),
      raceDay: JSON.parse(JSON.stringify(srcState.raceDay || { raceDays:[], activeRaceDayId:'' })),
      season: JSON.parse(JSON.stringify(srcState.season || { seasons:[], activeSeasonId:'' })),
      tracks: JSON.parse(JSON.stringify(srcState.tracks || { tracks:[], activeTrackId:'' })),
      personalRecords: JSON.parse(JSON.stringify(srcState.personalRecords || { bySeason:{}, byRaceDay:{} })),
      enduranceStints: JSON.parse(JSON.stringify(srcState.modes?.endurance?.stintHistoryByRace || {}))
    };
  }

  function isStateChunkEmpty(chunkKey, value){
    switch(String(chunkKey || '')){
      case 'masterData':
        return !Array.isArray(value?.drivers) || value.drivers.length===0
          ? (!Array.isArray(value?.cars) || value.cars.length===0)
          : false;
      case 'raceDay':
        return !Array.isArray(value?.raceDays) || value.raceDays.length===0;
      case 'season':
        return !Array.isArray(value?.seasons) || value.seasons.length===0;
      case 'tracks':
        return !Array.isArray(value?.tracks) || value.tracks.length===0;
      case 'personalRecords':
        return !Object.keys(value?.bySeason || {}).length && !Object.keys(value?.byRaceDay || {}).length;
      case 'enduranceStints':
        return !Object.keys(value || {}).length;
      default:
        return value == null;
    }
  }

  function buildSlimPersistedState(){
    return {
      ...state,
      masterData: {
        drivers: [],
        cars: []
      },
      media: {
        ...(state.media || {}),
        driverAvatars: {}
      },
      personalRecords: {
        bySeason: {},
        byRaceDay: {}
      },
      season: {
        ...(state.season || {}),
        seasons: []
      },
      tracks: {
        ...(state.tracks || {}),
        tracks: []
      },
      raceDay: {
        ...(state.raceDay || {}),
        raceDays: []
      },
      modes: {
        ...(state.modes || {}),
        endurance: {
          ...((state.modes && state.modes.endurance) || {}),
          stintHistoryByRace: {}
        }
      },
      session: {
        ...(state.session || {}),
        laps: [],
        idleLaps: []
      }
    };
  }

  function replaceObjectStoreData(tx, storeName, rows){
    const store = tx.objectStore(storeName);
    store.clear();
    for(const row of (rows || [])){
      if(row) store.put(row);
    }
  }

  async function persistExternalAppDataSnapshot(snapshot){
    const db = await getAppDataDb();
    await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_AVATAR_STORE, APP_DATA_SESSION_LAPS_STORE, APP_DATA_IDLE_LAPS_STORE], 'readwrite');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('IndexedDB write failed'));
      tx.onabort = ()=>reject(tx.error || new Error('IndexedDB write aborted'));
      replaceObjectStoreData(tx, APP_DATA_AVATAR_STORE, Object.entries(snapshot.driverAvatars || {}).map(([driverId, dataUrl])=>({ driverId, dataUrl })));
      replaceObjectStoreData(tx, APP_DATA_SESSION_LAPS_STORE, snapshot.laps || []);
      replaceObjectStoreData(tx, APP_DATA_IDLE_LAPS_STORE, snapshot.idleLaps || []);
    });
  }

  async function persistExternalStateChunkSnapshot(snapshot){
    const db = await getAppDataDb();
    await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_STATE_CHUNK_STORE], 'readwrite');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('IndexedDB chunk write failed'));
      tx.onabort = ()=>reject(tx.error || new Error('IndexedDB chunk write aborted'));
      replaceObjectStoreData(tx, APP_DATA_STATE_CHUNK_STORE, Object.entries(snapshot || {}).map(([chunkKey, value])=>({ chunkKey, value })));
    });
  }

  async function readAllFromObjectStore(tx, storeName){
    const store = tx.objectStore(storeName);
    return await idbRequestToPromise(store.getAll());
  }

  async function loadExternalAppDataSnapshot(){
    const db = await getAppDataDb();
    return await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_AVATAR_STORE, APP_DATA_SESSION_LAPS_STORE, APP_DATA_IDLE_LAPS_STORE], 'readonly');
      const out = { driverAvatars:{}, laps:[], idleLaps:[] };
      Promise.all([
        readAllFromObjectStore(tx, APP_DATA_AVATAR_STORE),
        readAllFromObjectStore(tx, APP_DATA_SESSION_LAPS_STORE),
        readAllFromObjectStore(tx, APP_DATA_IDLE_LAPS_STORE)
      ]).then(([avatars, laps, idleLaps])=>{
        for(const row of avatars || []){
          if(row?.driverId && row?.dataUrl) out.driverAvatars[row.driverId] = row.dataUrl;
        }
        out.laps = Array.isArray(laps) ? laps : [];
        out.idleLaps = Array.isArray(idleLaps) ? idleLaps : [];
      }).catch(reject);
      tx.oncomplete = ()=>resolve(out);
      tx.onerror = ()=>reject(tx.error || new Error('IndexedDB read failed'));
      tx.onabort = ()=>reject(tx.error || new Error('IndexedDB read aborted'));
    });
  }

  async function loadExternalStateChunkSnapshot(){
    const db = await getAppDataDb();
    return await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_STATE_CHUNK_STORE], 'readonly');
      const out = {
        masterData: { drivers:[], cars:[] },
        raceDay: { raceDays:[], activeRaceDayId:'' },
        season: { seasons:[], activeSeasonId:'' },
        tracks: { tracks:[], activeTrackId:'' },
        personalRecords: { bySeason:{}, byRaceDay:{} },
        enduranceStints: {}
      };
      readAllFromObjectStore(tx, APP_DATA_STATE_CHUNK_STORE).then((rows)=>{
        for(const row of rows || []){
          if(!row?.chunkKey) continue;
          out[row.chunkKey] = row.value;
        }
      }).catch(reject);
      tx.oncomplete = ()=>resolve(out);
      tx.onerror = ()=>reject(tx.error || new Error('IndexedDB chunk read failed'));
      tx.onabort = ()=>reject(tx.error || new Error('IndexedDB chunk read aborted'));
    });
  }

  function scheduleExternalAppDataPersist(){
    if(_appDataPersistTimer) clearTimeout(_appDataPersistTimer);
    _appDataPersistTimer = setTimeout(()=>{
      _appDataPersistTimer = null;
      const snapshot = buildExternalAppDataSnapshot();
      const chunkSnapshot = buildExternalStateChunkSnapshot();
      const run = async ()=>{
        try{
          await persistExternalAppDataSnapshot(snapshot);
          await persistExternalStateChunkSnapshot(chunkSnapshot);
        }catch(err){
          logLine('AppData Persist Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
      _appDataPersistInFlight = run().finally(()=>{
        if(_appDataPersistInFlight && typeof _appDataPersistInFlight.finally === 'function'){
          _appDataPersistInFlight = null;
        }
      });
    }, 350);
  }

  async function flushExternalAppDataPersist(){
    if(_appDataPersistTimer){
      clearTimeout(_appDataPersistTimer);
      _appDataPersistTimer = null;
      try{
        await persistExternalAppDataSnapshot(buildExternalAppDataSnapshot());
        await persistExternalStateChunkSnapshot(buildExternalStateChunkSnapshot());
      }catch(err){
        logLine('AppData Persist Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
      return;
    }
    if(_appDataPersistInFlight) await _appDataPersistInFlight;
  }

  async function clearExternalAppDataStores(){
    try{
      if(_appDataPersistTimer){
        clearTimeout(_appDataPersistTimer);
        _appDataPersistTimer = null;
      }
      _appDataPersistInFlight = null;
      const db = await getAppDataDb();
      await new Promise((resolve, reject)=>{
        const tx = db.transaction([APP_DATA_AVATAR_STORE, APP_DATA_SESSION_LAPS_STORE, APP_DATA_IDLE_LAPS_STORE, APP_DATA_STATE_CHUNK_STORE, APP_DATA_DISCORD_QUEUE_STORE], 'readwrite');
        tx.oncomplete = ()=>resolve();
        tx.onerror = ()=>reject(tx.error || new Error('IndexedDB clear failed'));
        tx.onabort = ()=>reject(tx.error || new Error('IndexedDB clear aborted'));
        tx.objectStore(APP_DATA_AVATAR_STORE).clear();
        tx.objectStore(APP_DATA_SESSION_LAPS_STORE).clear();
        tx.objectStore(APP_DATA_IDLE_LAPS_STORE).clear();
        tx.objectStore(APP_DATA_STATE_CHUNK_STORE).clear();
        tx.objectStore(APP_DATA_DISCORD_QUEUE_STORE).clear();
      });
    }catch(err){
      logLine('AppData Clear Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
    }
  }

  async function hydrateExternalAppData(){
    const legacyDriverAvatars = { ...((state.media && state.media.driverAvatars) || {}) };
    for(const driver of (state.masterData?.drivers || [])){
      const legacyPhoto = String(driver?.photoDataUrl || '').trim();
      if(legacyPhoto && !legacyDriverAvatars[driver.id]) legacyDriverAvatars[driver.id] = legacyPhoto;
      if(legacyPhoto) driver.photoDataUrl = '';
    }
    const legacySnapshot = {
      driverAvatars: legacyDriverAvatars,
      laps: Array.isArray(state.session?.laps) ? state.session.laps.slice() : [],
      idleLaps: Array.isArray(state.session?.idleLaps) ? state.session.idleLaps.slice() : []
    };
    const legacyChunkSnapshot = buildExternalStateChunkSnapshot();
    const hasLegacy = Object.keys(legacySnapshot.driverAvatars).length || legacySnapshot.laps.length || legacySnapshot.idleLaps.length;
    const hasLegacyChunks = Object.entries(legacyChunkSnapshot).some(([chunkKey, value])=>!isStateChunkEmpty(chunkKey, value));
    let externalSnapshot = { driverAvatars:{}, laps:[], idleLaps:[] };
    let externalChunks = {
      masterData: state.masterData || { drivers:[], cars:[] },
      raceDay: state.raceDay || { raceDays:[], activeRaceDayId:'' },
      season: state.season || { seasons:[], activeSeasonId:'' },
      tracks: state.tracks || { tracks:[], activeTrackId:'' },
      personalRecords: state.personalRecords || { bySeason:{}, byRaceDay:{} },
      enduranceStints: state.modes?.endurance?.stintHistoryByRace || {}
    };
    try{
      externalSnapshot = await loadExternalAppDataSnapshot();
      externalChunks = await loadExternalStateChunkSnapshot();
    }catch(err){
      logLine('AppData Laden Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      return;
    }
    const hasExternal = Object.keys(externalSnapshot.driverAvatars).length || externalSnapshot.laps.length || externalSnapshot.idleLaps.length;
    const hasExternalChunks = Object.entries(externalChunks).some(([chunkKey, value])=>!isStateChunkEmpty(chunkKey, value));
    if(!hasExternal && hasLegacy){
      externalSnapshot = legacySnapshot;
      await persistExternalAppDataSnapshot(externalSnapshot);
    }
    if(!hasExternalChunks && hasLegacyChunks){
      externalChunks = legacyChunkSnapshot;
      await persistExternalStateChunkSnapshot(externalChunks);
    }
    state.media = state.media || {};
    state.session = state.session || {};
    state.masterData = externalChunks.masterData || { drivers:[], cars:[] };
    state.raceDay = externalChunks.raceDay || { raceDays:[], activeRaceDayId:'' };
    state.season = externalChunks.season || { seasons:[], activeSeasonId:'' };
    state.tracks = externalChunks.tracks || { tracks:[], activeTrackId:'' };
    state.personalRecords = externalChunks.personalRecords || { bySeason:{}, byRaceDay:{} };
    state.modes = state.modes || {};
    state.modes.endurance = state.modes.endurance || {};
    state.modes.endurance.stintHistoryByRace = externalChunks.enduranceStints || {};
    state.media.driverAvatars = externalSnapshot.driverAvatars || {};
    state.session.laps = Array.isArray(externalSnapshot.laps) ? externalSnapshot.laps : [];
    state.session.idleLaps = Array.isArray(externalSnapshot.idleLaps) ? externalSnapshot.idleLaps : [];
    ensureAutoEntities(state);
    _appDataHydrated = true;
    saveState();
  }

  function saveState(){
    try{
      localStorage.setItem(LS_KEY, JSON.stringify(buildSlimPersistedState()));
    }catch(err){
      logLine('State Save Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
    }
    if(_appDataHydrated) scheduleExternalAppDataPersist();
  }

  
  
  function _deepFindArrays(root, predicate, maxDepth=6){
    const out = [];
    const seen = new Set();
    const stack = [{v:root, d:0}];
    while(stack.length){
      const {v,d} = stack.pop();
      if(v==null) continue;
      if(d>maxDepth) continue;
      if(typeof v === 'object'){
        if(seen.has(v)) continue;
        seen.add(v);
      }
      if(Array.isArray(v)){
        if(predicate(v)) out.push(v);
        // also scan items a bit
        if(d<maxDepth){
          for(const it of v){
            if(it && typeof it==='object') stack.push({v:it, d:d+1});
          }
        }
        continue;
      }
      if(typeof v === 'object'){
        for(const k of Object.keys(v)){
          try{
            stack.push({v:v[k], d:d+1});
          }catch{}
        }
      }
    }
    return out;
  }

  function _isDriverArray(arr){
    if(!Array.isArray(arr) || !arr.length) return false;
    // must be mostly drv_* ids (avoid cars and races)
    let drv=0, checked=0;
    for(const it of arr){
      if(!it || typeof it!=='object') continue;
      if(!('id' in it) || !('name' in it)) return false;
      const id = String(it.id||'');
      // exclude races/sessions
      if('mode' in it || 'submode' in it || 'trackId' in it || 'startedAt' in it || 'endedAt' in it) return false;
      checked++;
      if(id.startsWith('drv_')) drv++;
      if(checked>=10) break;
    }
    if(checked==0) return false;
    return (drv/checked) >= 0.6; // majority must be drv_*
  }

  function _isCarArray(arr){
    if(!Array.isArray(arr) || !arr.length) return false;
    const s = arr[0];
    if(!s || typeof s!=='object') return false;
    if(!('id' in s) || !('name' in s)) return false;
    // must have chip field (prevents matching drivers)
    return (('chipId' in s) || ('chipCode' in s));
  }

  function getDriversArray(){
    // Primary known locations
    if(Array.isArray(state.drivers)) return state.drivers;
    if(state.drivers && Array.isArray(state.drivers.drivers)) return state.drivers.drivers;

    // Heuristic search (project drift-safe)
    const found = _deepFindArrays(state, _isDriverArray);
    if(found.length){
      // prefer the biggest list
      found.sort((a,b)=>b.length-a.length);
      return found[0];
    }
    return [];
  }

  function getCarsArray(){
    if(Array.isArray(state.cars)) return state.cars;
    if(state.cars && Array.isArray(state.cars.cars)) return state.cars.cars;

    const found = _deepFindArrays(state, _isCarArray);
    if(found.length){
      found.sort((a,b)=>b.length-a.length);
      return found[0];
    }
    return [];
  }

  function ensureDriversArray(){
    // If we already have a driver array somewhere (heuristic), use it as primary store too.
    const existing = getDriversArray();
    if(existing && existing.length){
      if(Array.isArray(state.drivers)) return state.drivers;
      if(!state.drivers || typeof state.drivers!=='object') state.drivers = {drivers:existing};
      if(!Array.isArray(state.drivers.drivers)) state.drivers.drivers = existing;
      return state.drivers.drivers;
    }
    if(Array.isArray(state.drivers)) return state.drivers;
    if(!state.drivers || typeof state.drivers!=='object') state.drivers = {drivers:[]};
    if(!Array.isArray(state.drivers.drivers)) state.drivers.drivers = [];
    return state.drivers.drivers;
  }

  function ensureCarsArray(){
    const existing = getCarsArray();
    if(existing && existing.length){
      if(Array.isArray(state.cars)) return state.cars;
      if(!state.cars || typeof state.cars!=='object') state.cars = {cars:existing};
      if(!Array.isArray(state.cars.cars)) state.cars.cars = existing;
      return state.cars.cars;
    }
    if(Array.isArray(state.cars)) return state.cars;
    if(!state.cars || typeof state.cars!=='object') state.cars = {cars:[]};
    if(!Array.isArray(state.cars.cars)) state.cars.cars = [];
    return state.cars.cars;
  }

function downloadJson(filename, obj){
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 800);
  }

  function exportStammdaten(){
    const payload = {
      kind:'zeitnahme_stammdaten_v1',
      exportedAt: new Date().toISOString(),
      drivers: (state.masterData?.drivers||[]),
      cars: (state.masterData?.cars||[]),
    };
    const d = new Date();
    const fn = `stammdaten_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
    downloadJson(fn, payload);
    toast('Export', 'Stammdaten exportiert.', 'ok');
    if(!payload.drivers.length && !payload.cars.length){ logLine('WARN: Export Stammdaten ist leer – Daten liegen evtl. in anderer State-Struktur.'); }
    logLine('Export Stammdaten: '+fn);
  }

  function buildFullExportState(){
    const external = buildExternalAppDataSnapshot();
    const chunkSnapshot = buildExternalStateChunkSnapshot();
    return {
      ...state,
      masterData: chunkSnapshot.masterData,
      media: {
        ...(state.media || {}),
        driverAvatars: external.driverAvatars || {}
      },
      personalRecords: chunkSnapshot.personalRecords,
      season: chunkSnapshot.season,
      tracks: chunkSnapshot.tracks,
      raceDay: chunkSnapshot.raceDay,
      modes: {
        ...(state.modes || {}),
        endurance: {
          ...((state.modes && state.modes.endurance) || {}),
          stintHistoryByRace: chunkSnapshot.enduranceStints || {}
        }
      },
      session: {
        ...(state.session || {}),
        laps: Array.isArray(external.laps) ? external.laps : [],
        idleLaps: Array.isArray(external.idleLaps) ? external.idleLaps : []
      }
    };
  }

  function exportAll(){
    const payload = {
      kind:'zeitnahme_full_v1',
      exportedAt: new Date().toISOString(),
      state: buildFullExportState()
    };
    const d = new Date();
    const fn = `zeitnahme_backup_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.json`;
    downloadJson(fn, payload);
    toast('Backup', 'App-Backup exportiert.', 'ok');
    logLine('Export App-Backup: '+fn);
  }

  function normalizeName(s){ return String(s||'').trim().toLowerCase(); }
  function normalizeChipCode(s){ return String(s||'').trim().toUpperCase(); }

  function isRestoreStateCandidate(obj){
    if(!obj || typeof obj!=='object' || Array.isArray(obj)) return false;
    const keys = ['settings','masterData','session','tracks','raceDay','season','modes','ui','audio'];
    return keys.some(k => Object.prototype.hasOwnProperty.call(obj, k));
  }

  function extractRestorePayload(parsed){
    if(parsed && parsed.kind==='zeitnahme_full_v1' && parsed.state && typeof parsed.state==='object'){
      return parsed.state;
    }
    if(parsed && parsed.kind==='zeitnahme_stammdaten_v1'){
      throw new Error('restore_received_masterdata_export');
    }
    if(parsed && parsed.kind==='zeitnahme_audio_db_v1'){
      throw new Error('restore_received_audio_export');
    }
    if(isRestoreStateCandidate(parsed)){
      return parsed;
    }
    throw new Error('restore_invalid_file');
  }

  async function importStammdatenFile(file, allowDupNames=false){
    if(!file) throw new Error('import_missing_file');
    const text = await file.text();
    const obj = JSON.parse(text);
    return importStammdatenFromJson(obj, allowDupNames);
  }

  async function restoreStateFromFile(file){
    if(!file) throw new Error('restore_missing_file');
    const parsed = JSON.parse(await file.text());
    const restorePayload = extractRestorePayload(parsed);
    state = deepMerge(defaultState(), restorePayload);
    ensureAutoEntities(state);
    await clearExternalAppDataStores();
    saveState();
    await flushExternalAppDataPersist();
    renderAll();
    return true;
  }

  function importStammdatenFromJsonLegacy1(obj, allowDupNames=false){
    if(!obj || (obj.kind!=='zeitnahme_stammdaten_v1' && !(obj.drivers&&obj.cars))){
      toast('Import', 'Ungültige Datei.', 'err');
      return;
    }
    const driversIn = Array.isArray(obj.drivers) ? obj.drivers : [];
    const carsIn = Array.isArray(obj.cars) ? obj.cars : [];

    if(!state.masterData) state.masterData = {drivers:[], cars:[]};
    if(!Array.isArray(state.masterData.drivers)) state.masterData.drivers = [];
    if(!Array.isArray(state.masterData.cars)) state.masterData.cars = [];
    const drivers = state.masterData.drivers;
    const cars = state.masterData.cars;

    const driverIdSet = new Set(drivers.map(d=>d.id));
    const driverNameSet = new Set(drivers.map(d=>normalizeName(d.name)));

    const carIdSet = new Set(cars.map(c=>c.id));
    const carChipSet = new Set(cars.map(c=>String((c.chipCode ?? c.chipId ?? '')).trim()).filter(Boolean));

    let addD=0, skipD=0, addC=0, skipC=0;

    for(const d of driversIn){
      if(!d || !d.id){ skipD++; continue; }
      const nameKey = normalizeName(d.name);
      if(driverIdSet.has(d.id)){ skipD++; continue; }
      if(!allowDupNames && nameKey && driverNameSet.has(nameKey)){ skipD++; continue; }
      drivers.push(d);
      driverIdSet.add(d.id);
      if(nameKey) driverNameSet.add(nameKey);
      addD++;
    }

    for(const c of carsIn){
      if(!c || !c.id){ skipC++; continue; }
      const chip = String((c.chipCode ?? c.chipId ?? '')).trim();
      if(carIdSet.has(c.id)){ skipC++; continue; }
      if(chip && carChipSet.has(chip)){ skipC++; continue; }
      // normalize chip field
      if(c.chipId && !c.chipCode) c.chipCode = c.chipId;
      cars.push(c);
      carIdSet.add(c.id);
      if(chip) carChipSet.add(chip);
      addC++;
    }

    saveState();
    renderAll();
    toast('Import', `Fahrer neu: ${addD}, übersprungen: ${skipD} • Autos neu: ${addC}, übersprungen: ${skipC}`, 'ok');
    logLine(`Import Stammdaten: Fahrer neu=${addD} skip=${skipD}, Autos neu=${addC} skip=${skipC}`);
  }

  function importStammdatenFromJsonLegacy2(obj, allowDupNames=false){
    if(!obj || (obj.kind!=='zeitnahme_stammdaten_v1' && !(obj.drivers&&obj.cars))){
      throw new Error('import_invalid_masterdata_file');
    }
    const driversIn = Array.isArray(obj.drivers) ? obj.drivers : [];
    const carsIn = Array.isArray(obj.cars) ? obj.cars : [];

    if(!state.masterData) state.masterData = {drivers:[], cars:[]};
    if(!Array.isArray(state.masterData.drivers)) state.masterData.drivers = [];
    if(!Array.isArray(state.masterData.cars)) state.masterData.cars = [];
    const drivers = state.masterData.drivers;
    const cars = state.masterData.cars;

    const driverIdSet = new Set(drivers.map(d=>d.id));
    const driverNameSet = new Set(drivers.map(d=>normalizeName(d.name)));
    const carIdSet = new Set(cars.map(c=>c.id));
    const carChipSet = new Set(cars.map(c=>normalizeChipCode(c.chipCode ?? c.chipId ?? '')).filter(Boolean));

    let addD=0, skipD=0, addC=0, skipC=0;

    for(const d of driversIn){
      if(!d || !d.id){ skipD++; continue; }
      const nameKey = normalizeName(d.name);
      if(driverIdSet.has(d.id)){ skipD++; continue; }
      if(!allowDupNames && nameKey && driverNameSet.has(nameKey)){ skipD++; continue; }
      const importedDriver = JSON.parse(JSON.stringify(d));
      drivers.push(importedDriver);
      driverIdSet.add(importedDriver.id);
      if(nameKey) driverNameSet.add(nameKey);
      addD++;
    }

    for(const c of carsIn){
      if(!c || !c.id){ skipC++; continue; }
      const chip = normalizeChipCode(c.chipCode ?? c.chipId ?? '');
      if(carIdSet.has(c.id)){ skipC++; continue; }
      if(chip && carChipSet.has(chip)){ skipC++; continue; }
      const importedCar = JSON.parse(JSON.stringify(c));
      if(chip) importedCar.chipCode = chip;
      cars.push(importedCar);
      carIdSet.add(importedCar.id);
      if(chip) carChipSet.add(chip);
      addC++;
    }

    saveState();
    renderAll();
    toast('Import', `Fahrer neu: ${addD}, Ã¼bersprungen: ${skipD} â€¢ Autos neu: ${addC}, Ã¼bersprungen: ${skipC}`, 'ok');
    logLine(`Import Stammdaten: Fahrer neu=${addD} skip=${skipD}, Autos neu=${addC} skip=${skipC}`);
    return { addDrivers:addD, skipDrivers:skipD, addCars:addC, skipCars:skipC };
  }

  function importStammdatenFromJson(obj, allowDupNames=false){
    if(!obj || (obj.kind!=='zeitnahme_stammdaten_v1' && !(obj.drivers&&obj.cars))){
      throw new Error('import_invalid_masterdata_file');
    }
    const driversIn = Array.isArray(obj.drivers) ? obj.drivers : [];
    const carsIn = Array.isArray(obj.cars) ? obj.cars : [];

    if(!state.masterData) state.masterData = {drivers:[], cars:[]};
    if(!Array.isArray(state.masterData.drivers)) state.masterData.drivers = [];
    if(!Array.isArray(state.masterData.cars)) state.masterData.cars = [];
    const drivers = state.masterData.drivers;
    const cars = state.masterData.cars;

    const driverIdSet = new Set(drivers.map(d=>d.id));
    const driverNameSet = new Set(drivers.map(d=>normalizeName(d.name)));
    const carIdSet = new Set(cars.map(c=>c.id));
    const carChipSet = new Set(cars.map(c=>normalizeChipCode(c.chipCode ?? c.chipId ?? '')).filter(Boolean));

    let addD=0, skipD=0, addC=0, skipC=0;

    for(const d of driversIn){
      if(!d || !d.id){ skipD++; continue; }
      const nameKey = normalizeName(d.name);
      if(driverIdSet.has(d.id)){ skipD++; continue; }
      if(!allowDupNames && nameKey && driverNameSet.has(nameKey)){ skipD++; continue; }
      const importedDriver = JSON.parse(JSON.stringify(d));
      drivers.push(importedDriver);
      driverIdSet.add(importedDriver.id);
      if(nameKey) driverNameSet.add(nameKey);
      addD++;
    }

    for(const c of carsIn){
      if(!c || !c.id){ skipC++; continue; }
      const chip = normalizeChipCode(c.chipCode ?? c.chipId ?? '');
      if(carIdSet.has(c.id)){ skipC++; continue; }
      if(chip && carChipSet.has(chip)){ skipC++; continue; }
      const importedCar = JSON.parse(JSON.stringify(c));
      if(chip) importedCar.chipCode = chip;
      cars.push(importedCar);
      carIdSet.add(importedCar.id);
      if(chip) carChipSet.add(chip);
      addC++;
    }

    saveState();
    renderAll();
    toast('Import', `Fahrer neu: ${addD}, uebersprungen: ${skipD} | Autos neu: ${addC}, uebersprungen: ${skipC}`, 'ok');
    logLine(`Import Stammdaten: Fahrer neu=${addD} skip=${skipD}, Autos neu=${addC} skip=${skipC}`);
    return { addDrivers:addD, skipDrivers:skipD, addCars:addC, skipCars:skipC };
  }



  // --------------------- Toast + Log ---------------------
  function toast(title, msg, kind='info'){
    const host = document.getElementById('toastHost');
    const el = document.createElement('div');
    el.className = 'toast';
    const ico = document.createElement('div');
    ico.className = 'ico';
    ico.textContent = kind==='ok'?'✅':(kind==='warn'?'⚠️':(kind==='err'?'🧯':'ℹ️'));
    const body = document.createElement('div');
    body.innerHTML = `<p class="t-title"></p><p class="t-msg"></p>`;
    body.querySelector('.t-title').textContent = title;
    body.querySelector('.t-msg').textContent = msg;
    el.appendChild(ico); el.appendChild(body);
    host.appendChild(el);
    setTimeout(() => {
      el.style.opacity='0'; el.style.transform='translateY(6px)';
      el.style.transition='opacity .18s ease, transform .18s ease';
      setTimeout(()=>el.remove(), 220);
    }, 2600);
  }


  // Presenter (2. Monitor) – read-only Dashboard window (no server needed)
  let presenterWin = null;
  let presenterBc = null;
  try{ presenterBc = new BroadcastChannel('zeitnahme_presenter'); }catch{}

  
  function readLoopMinsFromUI(){
    const q = (sel)=>document.querySelector(sel);
    const num = (el, defV)=>{ const n=parseFloat(el?.value); return Number.isFinite(n)?n:defV; };
    return {
      trainingMin: Math.max(0, num(q('#loopTrainMin'), state.modes.loop.trainingMin||0)),
      setupMin: Math.max(0, num(q('#loopSetupMin'), state.modes.loop.setupMin||0)),
      raceMin: Math.max(0.01, num(q('#loopRaceMin'), state.modes.loop.raceMin||0.01)),
      podiumMin: Math.max(0, num(q('#loopPodiumMin'), state.modes.loop.podiumMin||0)),
    };
  }

function openPresenterWindow(){
    try{
      presenterWin = window.open('presenter.html', 'zeitnahme_presenter', 'width=1200,height=800');
      if(!presenterWin){
        toast('Presenter','Popup blockiert – bitte Popups für diese Seite erlauben.','warn');
      } else {
        toast('Presenter','Fenster geöffnet (2. Monitor).','ok');
        sendPresenterSnapshot(true);
      }
    }catch(e){
      toast('Presenter','Konnte Fenster nicht öffnen.','err');
    }
  }


  function getAverageLastNLapsMs(laps, driverId, n=10){
    try{
      const didNeedle = String(driverId||'').trim();
      if(!didNeedle) return null;
      const arr = (laps||[])
        .filter(l => l && l.lapMs!=null)
        .filter(l => String(driverKeyForLapGlobal(l) || '').trim()===didNeedle)
        .sort((a,b)=>((a.ts||0)-(b.ts||0)) || ((a.idx||0)-(b.idx||0)));
      if(!arr.length) return null;
      const tail = arr.slice(-Math.max(1, n|0));
      const sum = tail.reduce((acc,l)=>acc + Number(l.lapMs||0), 0);
      return tail.length ? (sum / tail.length) : null;
    }catch{
      return null;
    }
  }

  function buildFinalRaceRowsFromStandings(raceId, laps, track){
    const race = getRaceById(raceId);
    const standings = computeDriverStandingsGlobal(laps || []);
    const rows = standings.map((x, idx)=>{
      const drv = getDriver(x.id) || null;
      const bg = drv?.color || '';
      const tc = bg ? ((drv?.colorAutoText!==false) ? pickTextColorForBg(bg) : ((drv?.textColor)||pickTextColorForBg(bg))) : '';
      const totalMs = raceId ? (getDriverRaceTotalFromStartMs(raceId, x.id, laps) ?? x.totalMs ?? null) : (x.totalMs ?? null);
      return {
        driverId:x.id,
        pos: idx+1,
        name: x.name || ('Fahrer '+(idx+1)),
        laps: x.lapsCount || x.laps || 0,
        totalMs,
        bestMs: x.bestMs ?? null,
        lastMs: x.lastMs ?? null,
        avgLast10Ms: getAverageLastNLapsMs(laps, x.id, 10),
        avgLast10Text: (()=>{ const v=getAverageLastNLapsMs(laps, x.id, 10); return (v!=null && Number.isFinite(v)) ? msToTime(v, 3) : '—'; })(),
        avgSpeedText: formatKmh(lapMsToAverageKmh(x.bestMs, track)),
        finished: !!x.finished,
        bg,
        tc
      };
    });
    sortDriverStandingRows(rows, race, { live:false });
    rows.forEach((r,i)=>r.pos=i+1);
    return rows;
  }

  function buildPresenterSnapshot(){
    const track = getActiveTrack();
    const rd = getActiveRaceDay();
    const liveRaceId = state.session.currentRaceId || '';
    const podiumRaceId = state.ui?.podiumRaceId || '';
    const displayRaceId = liveRaceId || podiumRaceId || '';
    const activeRaceIdForState = liveRaceId || '';
    const displayRace = (displayRaceId && rd) ? (rd.races||[]).find(r=>r.id===displayRaceId) : null;
    const postRaceResultMode = !liveRaceId && !!podiumRaceId && !!displayRace && raceShouldShowPodium(displayRace);
    const modeLabel = getModeLabel();

    let timerText = '';
    try{
      timerText = computeTimerDisplay();
    }catch{}

    const recSeason = (track && state.season?.activeSeasonId) ? getTrackRecord(track, state.season.activeSeasonId) : null;
    const recDay = (rd && track) ? getRaceDayTrackRecord(rd, track.id) : null;

    const raceLapsAll = state.session.laps || [];
    const idleMode = (!displayRaceId && state.session.state==='IDLE');
    const lapsAll = idleMode ? (state.session.idleLaps || []) : raceLapsAll;
    const race = displayRace || null;
    const raceMode = race?.mode || null;
    const loopPhase = (state.loopRuntime?.phase || state.loop?.phase || state.session.loopPhase || '').toString().toUpperCase();
    const inRace = !!activeRaceIdForState && !isFreeDrivingRace(race) && (race?.submode!=='Training') && (raceMode!=='loop' || loopPhase==='RACE');

    const relevantLapsRaw = displayRaceId
      ? (postRaceResultMode
          ? (lapsAll||[]).filter(l=>l && l.raceId===displayRaceId)
          : getRelevantRaceLaps(displayRaceId, lapsAll))
      : lapsAll;
    // Live-Rundenzahl darf nie durch Darstellungsfilter verfälscht werden.
    // Deshalb für Dashboard/Presenter immer alle rennrelevanten Laps verwenden.
    const relevantLaps = (relevantLapsRaw||[]);

    let rows = [];
    try{
      if(inRace && race && (race.mode==='team' || race.mode==='endurance')){
        const st = computeTeamStandingsGlobal(relevantLaps, race.mode, (state.session.finish?.pending?state.session.finish:null));
        rows = st.map((x,idx)=>({
          pos: idx+1,
          name: x.name,
          laps: x.lapCount,
          totalMs: x.totalMs,
          bestMs: x.bestMs ?? null,
          lastMs: x.lastMs ?? null,
          avgSpeedText: formatKmh(lapMsToAverageKmh(x.bestMs, track)),
          finished: !!x.finished,
          bg: '', tc: ''
        }));
      }else{
        if(postRaceResultMode && displayRaceId){
          rows = buildFinalRaceRowsFromStandings(displayRaceId, relevantLaps, track);
        }else{
          const by = new Map();
          for(const l of relevantLaps){
            const did = l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '');
            if(!did || l.lapMs==null) continue;
            const cur = by.get(did) || {driverId:did, laps:0, totalMs:0, bestMs:null, lastMs:null, name:(getDriver(did)?.name||''), carsById:new Map()};
            cur.laps += 1;
            cur.totalMs += l.lapMs;
            cur.lastMs = l.lapMs;
            if(cur.bestMs==null || l.lapMs < cur.bestMs) cur.bestMs = l.lapMs;
            const carId = l.carId || '';
            const carName = carId ? (getCar(carId)?.name || '—') : '—';
            const carCur = cur.carsById.get(carId || '__unknown__') || {carId:carId || '', carName, bestMs:null};
            if(carCur.bestMs==null || l.lapMs < carCur.bestMs) carCur.bestMs = l.lapMs;
            cur.carsById.set(carId || '__unknown__', carCur);
            by.set(did, cur);
          }
          rows = Array.from(by.values()).map(r=>({
            driverId:r.driverId, pos:0, name:r.name || ('Fahrer '+r.driverId), laps:r.laps, totalMs:r.totalMs, bestMs:r.bestMs, lastMs:r.lastMs,
            avgLast10Ms: getAverageLastNLapsMs(relevantLaps, r.driverId, 10),
            avgLast10Text: (()=>{ const v=getAverageLastNLapsMs(relevantLaps, r.driverId, 10); return (v!=null && Number.isFinite(v)) ? msToTime(v, 3) : '—'; })(),
            avgSpeedText: formatKmh(lapMsToAverageKmh(r.bestMs, track)),
            finished:isDriverFinished(r.driverId),
            carBestRows: Array.from(r.carsById.values()).sort((a,b)=>((a.bestMs??9e15)-(b.bestMs??9e15)) || String(a.carName||'').localeCompare(String(b.carName||''),'de')),
            bg:(getDriver(r.driverId)?.color)||'',
            tc:((getDriver(r.driverId)?.colorAutoText!==false) ? pickTextColorForBg((getDriver(r.driverId)?.color)||'') : ((getDriver(r.driverId)?.textColor)||''))
          }));
          if(displayRaceId){
            rows.forEach(r=>{
              const rt = getDriverRaceTotalFromStartMs(displayRaceId, r.driverId, relevantLaps);
              if(rt!=null) r.totalMs = rt;
            });
          }
          if(inRace){
            const liveRaceRows = !!(displayRaceId && displayRaceId===state.session.currentRaceId && state.session.state==='RUNNING' && !(state.session.finish&&state.session.finish.pending));
            sortDriverStandingRows(rows, race, { live: liveRaceRows });
          }else{
            rows.sort((a,b)=> ((a.bestMs??9e15)-(b.bestMs??9e15)) || (String(a.name).localeCompare(String(b.name),'de')));
          }
          rows.forEach((r,i)=>r.pos=i+1);
        }
      }
    }catch{}

    let top3 = [];
    let showPodium = false;
    let raceEndHighlights = null;
    try{
      if(podiumRaceId && rd){
        const podiumRace = (rd.races||[]).find(r=>r.id===podiumRaceId) || null;
        if(podiumRace && podiumRace.endedAt && raceShouldShowPodium(podiumRace)){
          const podiumLaps = getRelevantRaceLaps(podiumRace.id, raceLapsAll);
          if(podiumRace.mode==='team' || podiumRace.mode==='endurance'){
            const st = computeTeamStandingsGlobal(podiumLaps, podiumRace.mode, null).slice(0,3);
            top3 = st.map(x=>({name:x.name, laps:x.lapCount, totalMs:x.totalMs, bestMs:x.bestMs ?? null, bg:'', tc:''}));
          }else{
            const fullStandings = computeDriverStandingsGlobal(podiumLaps);
            const st = fullStandings.slice(0,3);
            top3 = st.map(x=>({
              id:x.id,
              name:x.name, laps:(x.lapsCount||x.laps||0), totalMs:x.totalMs, bestMs:x.bestMs ?? null,
              avatarUrl:getDriverAvatarDataUrl(x.id),
              initials:initials(x.name),
              bg:(getDriver(x.id)?.color)||'',
              tc:((getDriver(x.id)?.colorAutoText!==false) ? pickTextColorForBg((getDriver(x.id)?.color)||'') : ((getDriver(x.id)?.textColor)||''))
            }));
            raceEndHighlights = computeRaceEndHighlights(podiumRace, podiumLaps, fullStandings);
          }
          showPodium = top3.length>0 && !isFreeDrivingRace(podiumRace);
        }
      } else if(raceMode==='loop'){
        showPodium = (loopPhase === 'PODIUM') && top3.length>0;
      }
    }catch{}

    let lastLapTime = '—', lastLapName='—';
    try{
      const last = lapsAll.slice(-1)[0];
      if(last && last.lapMs!=null){
        lastLapTime = msToTime(last.lapMs, 3);
        const car = last.carId ? getCar(last.carId) : null;
        const did = car?.driverId || last.driverId || '';
        lastLapName = did ? (getDriver(did)?.name||'—') : ((car?.name)||'—');
      }
    }catch{}

    const enduranceRows = (((raceMode==='endurance') || state.modes.activeMode==='endurance' || Object.keys(state.modes.endurance?.activeByTeamId||{}).length>0) ? getEnduranceStatusRows() : []);
    let averageSpeedText = '—';
    try{
      const lead = (rows||[])[0] || null;
      averageSpeedText = lead ? formatKmh(lapMsToAverageKmh(lead.bestMs, track)) : '—';
    }catch{}

    const recordSeasonText = (recSeason && recSeason.ms!=null) ? `${msToTime(recSeason.ms,3)} • ${(recSeason.driverId ? (getDriver(recSeason.driverId)?.name||recSeason.driverName) : recSeason.driverName)||'Unbekannt'}` : '—';
    const recordDayText = (recDay && recDay.ms!=null) ? `${msToTime(recDay.ms,3)} • ${(recDay.driverId ? (getDriver(recDay.driverId)?.name||recDay.driverName) : recDay.driverName)||'Unbekannt'}` : '—';

    return {
      modeLabel,
      inRace,
      showPodium,
      timerText,
      trackName: getTrackPlainName(track),
      trackDetails: getTrackDetailsText(track),
      trackLengthMeters: getTrackLengthMeters(track),
      scaleDenominator: getScaleDenominator(),
      recordSeason: recordSeasonText,
      recordDay: recordDayText,
      averageSpeedText,
      enduranceRows,
      rows,
      top3,
      raceEndHighlights,
      isFreeDriving: !!(race ? isFreeDrivingRace(race) : state.session?.isFreeDriving),
      lastLapTime,
      lastLapName,
      ampel: (state.ui && state.ui.ampel) ? state.ui.ampel : null
    };
  }

  function sendPresenterSnapshot(force=false){
    const payload = buildPresenterSnapshot();
    const nowTs = now();
    const timerKey = String(payload.timerText || '');
    const ampelKey = JSON.stringify(payload.ampel || null);
    const corePayload = {
      ...payload,
      timerText: '',
      ampel: null
    };
    const coreSig = JSON.stringify(corePayload);
    const minGap = (payload.ampel && payload.ampel.visible) ? 120 : 1000;

    if(!force){
      const sameCore = state.session._lastPresenterCoreSig === coreSig;
      const sameTimer = state.session._lastPresenterTimerKey === timerKey;
      const sameAmpel = state.session._lastPresenterAmpelKey === ampelKey;
      if(state.session._lastPresenterTs && (nowTs - state.session._lastPresenterTs) < minGap && sameCore && sameTimer && sameAmpel) return;
      if(sameCore && sameTimer && sameAmpel) return;
      if((nowTs - (state.session._lastPresenterTs || 0)) < minGap && sameCore && !sameTimer && sameAmpel){
        return;
      }
    }

    state.session._lastPresenterTs = nowTs;
    state.session._lastPresenterCoreSig = coreSig;
    state.session._lastPresenterTimerKey = timerKey;
    state.session._lastPresenterAmpelKey = ampelKey;

    const targetOrigin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : '*';
    try{
      if(presenterWin && presenterWin.closed) presenterWin = null;
    }catch{}
    try{ localStorage.setItem(PRES_SNAPSHOT_KEY, JSON.stringify(payload)); }catch{}
    try{ presenterBc?.postMessage({type:'snapshot', payload}); }catch{}
    try{ presenterWin?.postMessage({type:'snapshot', payload}, targetOrigin); }catch{}
  }

  window.addEventListener('message', (e)=>{
    try{
      if(e?.data?.type !== 'presenter-ready') return;
      sendPresenterSnapshot(true);
    }catch{}
  });


  function logLine(msg){
    const ts = new Date().toLocaleTimeString('de-DE',{hour12:false});
    const line = `[${ts}] ${msg}`;

    // Newest first (top)
    state.usb.lastLines.unshift(line);
    if(state.usb.lastLines.length>800) state.usb.lastLines = state.usb.lastLines.slice(0,800);

    const el = document.getElementById('runLog');
    if(el){
      el.textContent = state.usb.lastLines.slice(0,500).join('\n');
      el.scrollTop = 0;
    }
    saveState();
  }

  
  function deleteLapById(lapId){
    if(!lapId) return;
    const idx = state.session.laps.findIndex(l=>l && l.id===lapId);
    if(idx<0) return;

    const removed = state.session.laps.splice(idx,1)[0];

    // If lap entries have trackId (newer builds), we can recompute track record for that track/season.
    try{
      const trackId = removed?.trackId || '';
      const seasonId = state.season?.activeSeasonId || '';
      if(trackId && seasonId){
        recomputeTrackRecord(trackId, seasonId);
      }
    }catch{}

    saveState();
    toast('Runde gelöscht', 'Eintrag entfernt.', 'ok');
    logLine('Lap gelöscht: ' + String(lapId));
    renderAll();
  }

  function recomputeTrackRecord(trackId, seasonId){
    const track = state.tracks.tracks.find(t=>t.id===trackId);
    if(!track) return;
    const seasonNeedle = String(seasonId || '').trim();
    const raceSeasonById = new Map();
    const laps = state.session.laps.filter(l=>{
      if(!l || l.trackId!==trackId || l.lapMs==null) return false;
      if(!seasonNeedle) return true;
      const raceId = String(l.raceId || '').trim();
      if(!raceId) return false;
      if(!raceSeasonById.has(raceId)){
        let foundSeasonId = '';
        for(const raceDay of (state.raceDay?.raceDays || [])){
          const race = (raceDay.races || []).find(r=>r.id===raceId);
          if(race){
            foundSeasonId = String(race.seasonId || raceDay.seasonId || '').trim();
            break;
          }
        }
        raceSeasonById.set(raceId, foundSeasonId);
      }
      return raceSeasonById.get(raceId) === seasonNeedle;
    });
    if(!track.recordsBySeason) track.recordsBySeason = {};
    let best = null;
    let bestLap = null;
    for(const l of laps){
      if(best==null || l.lapMs < best){
        best = l.lapMs;
        bestLap = l;
      }
    }
    if(!track.recordsBySeason[seasonId]) track.recordsBySeason[seasonId] = { ms:null, driverName:'', carName:'' };
    if(bestLap){
      const car = bestLap.carId ? getCar(bestLap.carId) : null;
      const dn = bestLap.driverId ? (getDriver(bestLap.driverId)?.name || '') : (car?.driverId ? (getDriver(car.driverId)?.name||'') : '');
      track.recordsBySeason[seasonId] = { ms: bestLap.lapMs, driverName: dn||'', carName: car?.name||'' };
    } else {
      track.recordsBySeason[seasonId] = { ms:null, driverName:'', carName:'' };
    }
  }

// --------------------- Entities ---------------------
  
  
  
  function getScaleDenominator(){
    const n = Number(state.settings?.scaleDenominator || 50);
    return Number.isFinite(n) && n > 0 ? n : 50;
  }

  function lapMsToAverageKmh(lapMs, track){
    const lenM = getTrackLengthMeters(track);
    if(!lapMs || lapMs <= 0 || !lenM || lenM <= 0) return null;
    const scale = getScaleDenominator();
    const realMeters = lenM * scale;
    const seconds = lapMs / 1000;
    const mps = realMeters / seconds;
    return mps * 3.6;
  }

  function formatKmh(v){
    if(v==null || !Number.isFinite(v)) return '—';
    return String(v.toFixed(1)).replace('.', ',') + ' km/h';
  }

function getTrackLengthMeters(track){
    if(!track) return 0;
    const candidates = [
      track.displayLengthMeters,
      track.lengthMeters,
      track.trackLengthMeters,
      track.displayLength,
      track.length
    ];
    for(const raw of candidates){
      const v = Number(String(raw ?? '').replace(',', '.').trim());
      if(Number.isFinite(v) && v > 0) return v;
    }
    return 0;
  }

  function isAbsurdLapForTrack(lap, track){
    if(!lap || lap.lapMs==null) return true;
    const minLap = Number(track?.minLapMs || 0);
    return !!(minLap > 0 && Number(lap.lapMs) > (minLap * 3));
  }


  function getTrackPlainName(track){
    return String(track?.name || '—').trim() || '—';
  }

  function getTrackDetailsText(track){
    if(!track) return '—';
    const mode = String(track.setup?.mode || '—').trim();
    const tire = String(track.setup?.tireWear || '—').trim();
    const boost = track.setup?.boost ? 'Ja' : 'Nein';
    return `Modus: ${mode} • Reifenverschleiß: ${tire} • Boost: ${boost}`;
  }

function formatTrackDisplayName(track){
    if(!track) return '—';
    const base = String(track.name || 'Strecke').trim();
    const mode = String(track.setup?.mode || '—').trim();
    const tire = String(track.setup?.tireWear || '—').trim();
    const boost = track.setup?.boost ? 'Ja' : 'Aus';
    const lengthM = getTrackLengthMeters(track);
    const extra = [`M:${mode}`, `R:${tire}`, `B:${boost}`];
    if(lengthM > 0) extra.push(`L:${lengthM}m`);
    return `${base} ${extra.join(', ')}`.trim();
  }

function getActiveSeason(){ return state.season.seasons.find(s=>s.id===state.season.activeSeasonId) || null; }
  function getActiveTrack(){ return state.tracks.tracks.find(t=>t.id===state.tracks.activeTrackId) || null; }
  function getTrackRecord(track, seasonId){
    if(!track) return {ms:null,driverName:'',carName:''};
    const sid = seasonId || state.season.activeSeasonId;
    if(!track.recordsBySeason) track.recordsBySeason = {};
    if(!track.recordsBySeason[sid]) track.recordsBySeason[sid] = {ms:null,driverName:'',carName:''};
    return track.recordsBySeason[sid];
  }

  function getRaceDayTrackRecord(raceDay, trackId){
    if(!raceDay) return null;
    if(!raceDay.trackRecordsByTrackId || typeof raceDay.trackRecordsByTrackId!=='object'){
      raceDay.trackRecordsByTrackId = {};
    }
    if(!raceDay.trackRecordsByTrackId[trackId]){
      raceDay.trackRecordsByTrackId[trackId] = { ms:null, driverName:'', carName:'' };
    }
    return raceDay.trackRecordsByTrackId[trackId];
  }



  function getActiveRaceDay(){ return state.raceDay.raceDays.find(r=>r.id===state.raceDay.activeRaceDayId) || null; }
  
  function getDriverSpeakName(driverId){
    const d = getDriver(driverId);
    if(!d) return '';
    return String(d.phoneticName || d.ttsName || d.name || '').trim();
  }

function getDriver(id){ return state.masterData.drivers.find(d=>d.id===id) || null; }
  function getCar(id){ return state.masterData.cars.find(c=>c.id===id) || null; }
  function getCarsForDriver(driverId){ return state.masterData.cars.filter(c=>c.driverId===driverId); }

  // alias for older code paths
  function getCarsByDriver(driverId){ return getCarsForDriver(driverId); }

  function getModeLabel(){
    if(state.session?.isFreeDriving || state.ui?.freeDrivingEnabled) return t('mode.free_driving');
    if(!state.modes.activeMode) return t('mode.none');
    if(state.modes.activeMode==='single') return t('mode.single', { submode:t('submode.' + String(state.modes.singleSubmode||'').toLowerCase(), null, state.modes.singleSubmode) });
    if(state.modes.activeMode==='team') return t('mode.team');
    if(state.modes.activeMode==='loop'){
      const ph = state.loopRuntime?.phase || 'training';
      const label = t('submode.' + String(ph||'').toLowerCase(), null, ph);
      return t('mode.loop', { phase:label });
    }
    if(state.modes.activeMode==='endurance') return t('mode.endurance');
    return t('mode.none');
  }

  function getLapKind(){
    if(isFreeDrivingMode()) return 'training';
    if(!state.modes.activeMode) return 'training';
    if(state.modes.activeMode==='single'){
      if(state.modes.singleSubmode==='Training') return 'training';
      if(state.modes.singleSubmode==='Qualifying') return 'qualifying';
      return 'race';
    }
    return 'race';
  }



  function sanitizeDiscordFilename(name){
    return String(name||'summary.png').replace(/[^A-Za-z0-9._-]+/g,'_');
  }

  function safeHexToRgb(hex, fallback){
    const fb = fallback || [110,140,255];
    const s = String(hex||'').trim();
    const m = s.match(/^#?([0-9a-fA-F]{6})$/);
    if(!m) return fb;
    const h = m[1];
    return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
  }


  function getChartSeriesColor(series, idx=0){
    const own = String(series?.color||'').trim();
    if(/^#?[0-9a-fA-F]{6}$/.test(own)) return own.startsWith('#') ? own : ('#'+own);
    const palette = [
      '#5e97ff', '#62d296', '#ff835c', '#d66cff', '#f2c14e', '#4dd0e1',
      '#ff5fa2', '#8bc34a', '#ffb74d', '#7986cb', '#26c6da', '#ec407a',
      '#9ccc65', '#ffa726', '#7e57c2', '#26a69a'
    ];
    const n = palette.length || 1;
    const i = Number.isFinite(Number(idx)) ? Math.abs(Number(idx)) % n : 0;
    return palette[i];
  }


  function buildDistinctSeriesColorMap(seriesList){
    const palette = [
      '#5e97ff', '#62d296', '#ff835c', '#d66cff', '#f2c14e', '#4dd0e1',
      '#ff5fa2', '#8bc34a', '#ffb74d', '#7986cb', '#26c6da', '#ec407a',
      '#9ccc65', '#ffa726', '#7e57c2', '#26a69a', '#ef5350', '#29b6f6',
      '#ab47bc', '#66bb6a', '#ffee58', '#ff7043', '#8d6e63', '#42a5f5'
    ];
    const normalizedCounts = new Map();
    const normalized = (seriesList||[]).map((series, idx)=>{
      const own = getChartSeriesColor(series, idx);
      const key = String(own || '').toLowerCase();
      normalizedCounts.set(key, (normalizedCounts.get(key) || 0) + 1);
      return own;
    });
    const used = new Set();
    const out = new Map();
    (seriesList||[]).forEach((series, idx)=>{
      const key = String(series?.driverId || series?.id || series?.name || idx);
      const own = normalized[idx];
      const ownKey = String(own || '').toLowerCase();
      let color = own;
      if(!own || normalizedCounts.get(ownKey) > 1 || used.has(ownKey)){
        color = palette.find(c=>!used.has(String(c).toLowerCase())) || palette[idx % palette.length];
      }
      const colorKey = String(color || '').toLowerCase();
      used.add(colorKey);
      out.set(key, color);
    });
    return out;
  }

  function formatDiscordDateTime(ts){
    if(!ts) return '—';
    try{ return new Date(ts).toLocaleString('de-DE'); }catch{ return '—'; }
  }

  function getTrackById(trackId){
    return state.tracks.tracks.find(t=>t.id===trackId) || null;
  }

  function buildRacePositionTimeline(race, laps){
    const ordered = (laps||[]).filter(l=>l && l.lapMs!=null).slice().sort((a,b)=>{
      const at = Number(a.ts||a.time||0), bt = Number(b.ts||b.time||0);
      if(at!==bt) return at-bt;
      const al = Number(a.lapNo||0), bl = Number(b.lapNo||0);
      if(al!==bl) return al-bl;
      return String(driverKeyForLapGlobal(a)).localeCompare(String(driverKeyForLapGlobal(b)),'de');
    });
    const byDriver = new Map();
    for(const lap of ordered){
      const did = String(driverKeyForLapGlobal(lap)||'').trim();
      if(!did) continue;
      if(!byDriver.has(did)) byDriver.set(did, []);
      byDriver.get(did).push(lap);
    }
    const driverIds = Array.from(byDriver.keys());
    const maxLap = Math.max(0, ...Array.from(byDriver.values()).map(arr=>arr.length));
    const history = new Map(driverIds.map(did=>[did, []]));
    for(let lapNo=1; lapNo<=maxLap; lapNo++){
      const snapshot = [];
      for(const did of driverIds){
        const dlaps = byDriver.get(did) || [];
        const upto = dlaps.slice(0, Math.min(lapNo, dlaps.length));
        snapshot.push(...upto);
      }
      const standings = computeDriverStandingsGlobal(snapshot);
      const posMap = new Map(standings.map((s,idx)=>[s.id, idx+1]));
      for(const did of driverIds){
        history.get(did).push({ lap: lapNo, pos: posMap.get(did) || standings.length || driverIds.length || 1 });
      }
    }
    return driverIds.map(driverId=>({
      driverId,
      name: driverNameByIdGlobal(driverId),
      color: (getDriver(driverId)?.color)||'',
      points: history.get(driverId) || []
    }));
  }

  function buildRaceSummaryData(raceId){
    const race = getRaceById(raceId);
    if(!race) return null;
    const laps = getRelevantRaceLaps(raceId, state.session.laps||[]);
    const track = getTrackById(race.trackId) || getActiveTrack();
    const freeDriving = isFreeDrivingRace(race);
    const standings = computeDriverStandingsGlobal(laps);
    const top3 = standings.slice(0,3);
    const bestLap = (laps||[]).filter(l=>l && l.lapMs!=null).slice().sort((a,b)=>(a.lapMs||9e15)-(b.lapMs||9e15))[0] || null;
    const chart = freeDriving ? [] : buildRacePositionTimeline(race, laps);
    const title = freeDriving ? 'Freies Fahren' : 'Rennergebnis';
    return {
      raceId,
      race,
      laps,
      track,
      freeDriving,
      standings,
      top3,
      bestLap,
      chart,
      title,
      subtitle: `${getTrackPlainName(track)} • ${race.submode || getModeLabel() || race.mode || 'Session'}`
    };
  }


  function buildLapTableRows(summary){
    const standings = Array.isArray(summary?.standings) ? summary.standings : [];
    const laps = Array.isArray(summary?.laps) ? summary.laps.filter(l=>l && l.lapMs!=null) : [];
    const byDriver = new Map();
    for(const lap of laps){
      const did = driverKeyForLapGlobal(lap);
      if(!did) continue;
      if(!byDriver.has(did)) byDriver.set(did, []);
      byDriver.get(did).push(lap);
    }
    const rows = standings.map((row, idx)=>{
      const driverId = String(row?.id || '').trim();
      const driverLaps = (byDriver.get(driverId) || []).slice().sort((a,b)=>{
        const ao = Number.isFinite(Number(a?.lapNo)) ? Number(a.lapNo) : Infinity;
        const bo = Number.isFinite(Number(b?.lapNo)) ? Number(b.lapNo) : Infinity;
        if(ao !== bo) return ao - bo;
        const at = Number(a?.ts || a?.time || 0);
        const bt = Number(b?.ts || b?.time || 0);
        return at - bt;
      });
      const bestLapMs = Number.isFinite(Number(row?.bestMs)) ? Number(row.bestMs) : (driverLaps.reduce((m,l)=>Math.min(m, Number(l?.lapMs)||Infinity), Infinity));
      const lapItems = driverLaps.map((lap, lapIdx)=>{
        const lapMs = Number(lap?.lapMs);
        const lapNo = Number.isFinite(Number(lap?.lapNo)) ? Number(lap.lapNo) : (lapIdx + 1);
        const txt = `${lapNo}. ${Number.isFinite(lapMs) ? msToTime(lapMs,3) : '—'}`;
        return {
          lapNo,
          lapMs: Number.isFinite(lapMs) ? lapMs : null,
          text: txt,
          isBest: Number.isFinite(lapMs) && Number.isFinite(bestLapMs) && lapMs === bestLapMs
        };
      });
      return {
        id: driverId,
        pos: idx + 1,
        name: String(row?.name || driverNameByIdGlobal(driverId) || '—'),
        best: Number.isFinite(bestLapMs) ? msToTime(bestLapMs,3) : '—',
        bestLapMs: Number.isFinite(bestLapMs) ? bestLapMs : null,
        lapCount: lapItems.length,
        laps: lapItems,
        color: getDriver(driverId)?.color || '',
        _lapLines: lapItems.length ? chunkTextList(lapItems.map(x=>x.text), 46) : ['Keine gültigen Runden']
      };
    });
    return rows;
  }

  function chunkTextList(items, maxLen=46){
    const out = [];
    let line = '';
    for(const raw of (items||[])){
      const item = String(raw || '').trim();
      if(!item) continue;
      const next = line ? `${line}  •  ${item}` : item;
      if(next.length > maxLen && line){
        out.push(line);
        line = item;
      } else {
        line = next;
      }
    }
    if(line) out.push(line);
    return out.length ? out : ['—'];
  }

  async function renderRaceSummaryBlob(summary){
    const width = 1600, height = 900;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218', panel='#181c24', panel2='#1d222c', text='#eff3f8', muted='#a5afbe', grid='#3b4658';
    function rr(x,y,w,h,r,fill){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } }
    function txt(str,x,y,font,color,align='left'){ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='top'; ctx.fillText(String(str||''),x,y); }
    function fitText(str,maxWidth,startPx,weight='700'){ let px=startPx; for(; px>=16; px-=2){ ctx.font=`${weight} ${px}px sans-serif`; if(ctx.measureText(String(str||'')).width<=maxWidth) break; } return `${weight} ${px}px sans-serif`; }
    function clipCircle(x,y,r){ ctx.save(); ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.closePath(); ctx.clip(); }
    function drawAvatarOrInitial(row,cx,cy,r){
      const avatarSrc = row?.avatarUrl || getDriverAvatarDataUrl(row?.id);
      return loadImageFromUrl(avatarSrc).then(img=>{
        ctx.save();
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.closePath();
        ctx.fillStyle = '#10141b'; ctx.fill();
        if(img){
          ctx.clip();
          ctx.drawImage(img, cx-r, cy-r, r*2, r*2);
        } else {
          ctx.fillStyle = '#293142';
          ctx.fill();
          const ini = String((row?.name||'').trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase() || '?');
          txt(ini, cx, cy-18, '700 30px sans-serif', text, 'center');
        }
        ctx.restore();
        ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.closePath();
        ctx.lineWidth = 4; ctx.strokeStyle = '#e8edf5'; ctx.stroke();
      });
    }
    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);
    for(let i=0;i<width;i+=82){ ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-220,height); ctx.stroke(); }
    rr(40,30,width-80,104,28,panel);
    txt('TimTime Race Summary',70,54,'700 44px sans-serif',text);
    txt(summary.subtitle || 'Session', width-70, 60, '400 24px sans-serif', muted, 'right');
    rr(40,160,460,680,28,panel);
    rr(530,160,1030,680,28,panel);
    txt(summary.freeDriving ? 'Bestzeiten' : 'Podium',70,190,'700 30px sans-serif',text);
    const standings = summary.standings || [];
    if(summary.freeDriving){
      const rows = standings.slice(0,8);
      rows.forEach((row,idx)=>{
        const y = 250 + idx*68;
        rr(70,y,400,54,18,panel2);
        txt(String(idx+1), 96, y+11, '700 24px sans-serif', muted);
        txt(row.name||'—', 140, y+10, fitText(row.name||'—', 170, 24), text);
        txt(row.bestMs!=null ? msToTime(row.bestMs,3) : '—', 450, y+11, '700 24px monospace', text, 'right');
      });
      txt('Schnellste Runde',70,810-90,'400 22px sans-serif',muted);
      txt(summary.bestLap ? `${driverNameByIdGlobal(driverKeyForLapGlobal(summary.bestLap))} • ${msToTime(summary.bestLap.lapMs,3)}` : '—',70,810-56,'700 28px sans-serif',text);
    } else {
      const podium = [standings[1]||null, standings[0]||null, standings[2]||null];
      const podiumColors = ['#b9c1c9','#e8bf5a','#b07a52'];
      const podiumHeights = [132,180,96];
      const xs = [95,225,355];
      const baseY = 610;
      const avatarPromises = [];
      podium.forEach((row,idx)=>{
        const x = xs[idx], w=110, h=podiumHeights[idx], y=baseY-h;
        rr(x,y,w,h,18,podiumColors[idx]);
        txt(String(idx===1?1:(idx===0?2:3)), x+w/2, y+26, '700 52px sans-serif', '#191919', 'center');
        const name = row?.name || '—';
        const avatarY = y-86;
        const nameY = y-34;
        avatarPromises.push(drawAvatarOrInitial(row, x+w/2, avatarY, 42));
        txt(name, x+w/2, nameY, fitText(name, 190, 24), text, 'center');
      });
      await Promise.all(avatarPromises);
      txt('Schnellste Runde',70,665,'400 22px sans-serif',muted);
      txt(summary.bestLap ? `${driverNameByIdGlobal(driverKeyForLapGlobal(summary.bestLap))} • ${msToTime(summary.bestLap.lapMs,3)}` : '—',70,700,'700 28px sans-serif',text);
      txt('Beendet',70,755,'400 22px sans-serif',muted);
      txt(formatDiscordDateTime(summary.race?.endedAt),70,790,'700 28px sans-serif',text);
    }
    txt(summary.freeDriving ? 'Bestzeiten der Session' : 'Positionsverlauf',560,190,'700 30px sans-serif',text);
    rr(590,245,920,515,24,panel2);
    if(summary.freeDriving){
      const rows = standings.slice(0,10);
      const barX = 640, barW = 760, barY = 300, rowH = 38;
      const values = rows.map(r=>Number(r.bestMs||0)).filter(Boolean);
      const min = values.length ? Math.min(...values) : 0;
      const max = values.length ? Math.max(...values) : 1;
      rows.forEach((row,idx)=>{
        const color = getChartSeriesColor({color:getDriver(row.id)?.color}, idx);
        const y = barY + idx*46;
        txt(row.name||'—', 620, y+3, fitText(row.name||'—', 190, 22), text);
        rr(860, y+2, barW, rowH, 16, '#242b36');
        const frac = max===min ? 0.82 : (1 - ((row.bestMs-min)/(max-min))*0.72);
        rr(860, y+2, Math.max(80, Math.min(barW, barW*frac)), rowH, 16, color);
        txt(row.bestMs!=null ? msToTime(row.bestMs,3) : '—', 1570, y+6, '700 20px monospace', text, 'right');
      });
    } else {
      const chart = summary.chart || [];
      const chartColorMap = buildDistinctSeriesColorMap(chart);
      const plot = { x:650, y:285, w:800, h:420 };
      const maxLap = Math.max(2, ...chart.map(c=>Math.max(0,...c.points.map(p=>p.lap||0))), 2);
      const maxPos = Math.max(2, standings.length, 2);
      for(let i=0;i<maxLap;i++){
        const x = plot.x + (i*(plot.w-40)/Math.max(1,maxLap-1));
        ctx.strokeStyle = grid; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,plot.y); ctx.lineTo(x,plot.y+plot.h); ctx.stroke();
        txt(String(i+1), x, plot.y+plot.h+10, '400 16px sans-serif', muted, 'center');
      }
      for(let pos=1; pos<=maxPos; pos++){
        const y = plot.y + ((pos-1)*(plot.h-20)/Math.max(1,maxPos-1));
        ctx.strokeStyle = grid; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(plot.x,y); ctx.lineTo(plot.x+plot.w,y); ctx.stroke();
        txt(String(pos), plot.x-18, y-10, '400 16px sans-serif', muted, 'right');
      }
      const overlapLaneMap = new Map();
      const overlapGapPx = 9;
      chart.forEach((series,idx)=>{
        const sid = String(series?.driverId || series?.id || series?.name || idx);
        (series?.points||[]).forEach((p)=>{
          const lap = Number(p?.lap || 1);
          const pos = Number(p?.pos || 1);
          const key = `${lap}|${pos}`;
          if(!overlapLaneMap.has(key)) overlapLaneMap.set(key, []);
          overlapLaneMap.get(key).push(sid);
        });
      });
      overlapLaneMap.forEach((arr,key)=>{
        const uniq = [];
        for(const sid of arr){ if(!uniq.includes(sid)) uniq.push(sid); }
        overlapLaneMap.set(key, uniq);
      });
      const overlapXGapPx = 10;
      const overlapYGapPx = 7;
      function getChartPointCoords(series, idx, p){
        const sid = String(series?.driverId || series?.id || series?.name || idx);
        const lap = Number(p?.lap || 1);
        const pos = Number(p?.pos || 1);
        const baseX = plot.x + ((lap-1)*(plot.w-40)/Math.max(1,maxLap-1));
        const baseY = plot.y + ((pos-1)*(plot.h-20)/Math.max(1,maxPos-1));
        const laneList = overlapLaneMap.get(`${lap}|${pos}`) || [sid];
        const laneIdx = Math.max(0, laneList.indexOf(sid));
        const center = (laneList.length - 1) / 2;
        const laneShift = (laneIdx - center);
        const x = baseX + (laneShift * overlapXGapPx);
        const y = baseY + (laneShift * overlapYGapPx);
        return { x, y };
      }
      chart.forEach((series,idx)=>{
        const lineColor = chartColorMap.get(String(series?.driverId || series?.id || series?.name || idx)) || getChartSeriesColor(series, idx);
        const rgb = safeHexToRgb(lineColor, [94,151,255]);
        ctx.strokeStyle = `rgb(${rgb.join(',')})`;
        ctx.fillStyle = `rgb(${rgb.join(',')})`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        series.points.forEach((p,pi)=>{
          const {x,y} = getChartPointCoords(series, idx, p);
          if(pi===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.stroke();
        series.points.forEach(p=>{
          const {x,y} = getChartPointCoords(series, idx, p);
          ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
          ctx.strokeStyle = `rgb(${rgb.join(',')})`; ctx.lineWidth=5;
        });
      });
      let lx=620, ly=785;
      chart.forEach((series,idx)=>{
        const lineColor = chartColorMap.get(String(series?.driverId || series?.id || series?.name || idx)) || getChartSeriesColor(series, idx);
        const rgb = safeHexToRgb(lineColor, [94,151,255]);
        rr(lx,ly,170,34,17,'#212733');
        ctx.fillStyle=`rgb(${rgb.join(',')})`; ctx.beginPath(); ctx.arc(lx+18, ly+17, 8, 0, Math.PI*2); ctx.fill();
        txt(series.name||'—', lx+36, ly+6, fitText(series.name||'—', 120, 18), text);
        lx += 184;
        if(lx>1360){ lx=620; ly+=42; }
      });
    }
    rr(40,855,width-80,26,12,'#161a21');
    txt(summary.freeDriving ? 'Automatische Discord-Zusammenfassung • Freies Fahren' : 'Automatische Discord-Zusammenfassung • Rennen', 60, 858, '400 16px sans-serif', muted);
    const blob = await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
    return blob;
  }


  function wrapTokensToLines(ctx, tokens, maxWidth){
    const lines = [];
    let current = '';
    for(const token of (tokens||[])) {
      const probe = current ? `${current}    ${token}` : token;
      if(current && ctx.measureText(probe).width > maxWidth){
        lines.push(current);
        current = token;
      } else {
        current = probe;
      }
    }
    if(current) lines.push(current);
    return lines.length ? lines : ['—'];
  }

  async function renderRaceLapTableBlob(summary){
    const rows = buildLapTableRows(summary);
    const width = 1900;
    const margins = { left: 44, right: 44, top: 36, bottom: 36 };
    const col = { pos: 70, driver: 360, best: 180 };
    const lapsX = margins.left + col.pos + col.driver + col.best + 48;
    const lapsWidth = width - margins.right - lapsX;
    const headH = 122;
    const tableHeadH = 44;
    const rowGap = 12;
    const rowHeights = [];
    const canvas = document.createElement('canvas');
    const probe = canvas.getContext('2d');
    probe.font = '500 24px monospace';
    for(const row of rows){
      const lines = wrapTokensToLines(probe, row.laps, lapsWidth - 24);
      row._lapLines = lines;
      rowHeights.push(Math.max(60, 22 + lines.length * 30));
    }
    const tableHeight = rowHeights.reduce((a,b)=>a+b,0) + Math.max(0, rows.length-1)*rowGap;
    const height = margins.top + headH + 18 + tableHeadH + 12 + tableHeight + margins.bottom;
    canvas.width = width;
    canvas.height = Math.max(420, height);
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218', panel='#181c24', panel2='#1d222c', text='#eff3f8', muted='#a5afbe', border='#2a3342';
    function rr(x,y,w,h,r,fill,stroke=''){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } }
    function txt(str,x,y,font,color,align='left'){ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='top'; ctx.fillText(String(str||''),x,y); }
    function fitText(str,maxWidth,startPx,weight='700'){ let px=startPx; for(; px>=16; px-=1){ ctx.font=`${weight} ${px}px sans-serif`; if(ctx.measureText(String(str||'')).width<=maxWidth) break; } return `${weight} ${px}px sans-serif`; }

    ctx.fillStyle = bg; ctx.fillRect(0,0,width,canvas.height);
    for(let i=0;i<width;i+=92){ ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-260,canvas.height); ctx.stroke(); }
    rr(margins.left, margins.top, width - margins.left - margins.right, headH, 26, panel);
    txt('TimTime Session-Laptabelle', margins.left + 28, margins.top + 24, '700 42px sans-serif', text);
    txt(summary.subtitle || 'Session', width - margins.right - 28, margins.top + 28, '400 24px sans-serif', muted, 'right');
    const metaY = margins.top + 78;
    const race = summary?.race || {};
    txt(`Session: ${race.name || '—'}`, margins.left + 30, metaY, '500 18px sans-serif', muted);
    txt(`Beendet: ${formatDiscordDateTime(race.endedAt)}`, margins.left + 430, metaY, '500 18px sans-serif', muted);
    txt(`Fahrer: ${rows.length}`, width - margins.right - 28, metaY, '500 18px sans-serif', muted, 'right');

    const top = margins.top + headH + 18;
    rr(margins.left, top, width - margins.left - margins.right, tableHeadH, 18, '#202633');
    txt('#', margins.left + 24, top + 8, '700 22px sans-serif', text);
    txt('Fahrer', margins.left + col.pos + 18, top + 8, '700 22px sans-serif', text);
    txt('Bestzeit', margins.left + col.pos + col.driver + 18, top + 8, '700 22px sans-serif', text);
    txt('Rundenzeiten', lapsX + 12, top + 8, '700 22px sans-serif', text);

    let y = top + tableHeadH + 12;
    rows.forEach((row, idx)=>{
      const h = rowHeights[idx];
      rr(margins.left, y, width - margins.left - margins.right, h, 18, idx % 2 ? panel : panel2, border);
      txt(String(row.pos), margins.left + 28, y + 16, '700 26px sans-serif', muted);
      txt(row.name, margins.left + col.pos + 18, y + 16, fitText(row.name, col.driver - 36, 28), text);
      txt(row.best, margins.left + col.pos + col.driver + 18, y + 16, '700 24px monospace', text);
      txt(`${row.lapCount} Runden`, margins.left + col.pos + col.driver + 18, y + 48, '400 16px sans-serif', muted);
      let ly = y + 14;
      for(const line of row._lapLines){
        txt(line, lapsX + 12, ly, '500 24px monospace', text);
        ly += 30;
      }
      y += h + rowGap;
    });
    rr(margins.left, canvas.height - 28, width - margins.left - margins.right, 12, 6, '#161a21');
    txt('Session-Webhook • Fahrer, Bestzeit und komplette Rundenliste als Grafik', margins.left + 14, canvas.height - 27, '400 14px sans-serif', muted);
    const blob = await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
    return blob;
  }


  function buildLapColumnData(summary){
    const rows = buildLapTableRows(summary);
    const maxLaps = rows.reduce((m,row)=>Math.max(m, Array.isArray(row.laps)?row.laps.length:0), 0);
    return { rows, maxLaps };
  }

  async function renderRaceLapColumnsBlob(summary){
    const { rows, maxLaps } = buildLapColumnData(summary);
    const rowColorMap = buildDistinctSeriesColorMap(rows.map((row, idx)=>({ id:row.id, name:row.name, color:row.color, idx })));
    const width = 1600;
    const margins = { left: 36, right: 36, top: 30, bottom: 28 };
    const colGap = 14;
    const maxColsPerRow = rows.length > 8 ? 4 : rows.length > 6 ? 5 : 6;
    const chunkedRows = [];
    for(let i=0; i<rows.length; i += maxColsPerRow) chunkedRows.push(rows.slice(i, i + maxColsPerRow));
    const contentWidth = width - margins.left - margins.right;
    const headerH = 116;
    const lapHeadH = 42;
    const rowH = 34;
    const bandGap = 22;
    const perBandHeight = headerH + 12 + lapHeadH + Math.max(1, maxLaps) * rowH;
    const height = Math.max(280, margins.top + 84 + chunkedRows.length * perBandHeight + Math.max(0, chunkedRows.length - 1) * bandGap + margins.bottom);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218', panel = '#181c24', panel2 = '#1d222c', text = '#eff3f8', muted = '#a5afbe', border = '#2a3342', accent = '#5e97ff', bestFill = '#183221', bestStroke = '#2ed17d', overallFill = '#2d2312', overallStroke = '#f2c14e';
    const overallBestMs = rows.reduce((m,row)=>Number.isFinite(row.bestLapMs) ? Math.min(m,row.bestLapMs) : m, Infinity);
    function rr(x,y,w,h,r,fill,stroke=''){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } }
    function txt(str,x,y,font,color,align='left'){ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='top'; ctx.fillText(String(str||''),x,y); }
    function fitText(str,maxWidth,startPx,weight='700'){ let px=startPx; for(; px>=14; px-=1){ ctx.font=`${weight} ${px}px sans-serif`; if(ctx.measureText(String(str||'')).width<=maxWidth) break; } return `${weight} ${px}px sans-serif`; }

    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);
    for(let i=0;i<width;i+=92){ ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-220,height); ctx.stroke(); }
    rr(margins.left, margins.top, contentWidth, height - margins.top - margins.bottom, 26, panel, border);
    txt('Rundenübersicht', margins.left + 24, margins.top + 18, '700 34px sans-serif', text);
    txt('Fahrer oben • beste Runde farbig markiert', width - margins.right - 24, margins.top + 22, '400 18px sans-serif', muted, 'right');
    let bandY = margins.top + 68;
    chunkedRows.forEach((group, groupIdx)=>{
      const colCount = Math.max(1, group.length || 1);
      const colWidth = Math.max(180, Math.floor((contentWidth - colGap * Math.max(0, colCount - 1)) / colCount));
      for(let i=0;i<colCount;i++){
        const row = group[i] || { name:'—', best:'—', lapCount:0, laps:[], bestLapMs:null, pos:0, color:'' };
        const x = margins.left + i * (colWidth + colGap);
        const headerBg = groupIdx % 2 ? panel2 : '#202633';
        rr(x, bandY, colWidth, headerH, 18, headerBg, border);
        txt(`${row.pos}. ${row.name}`, x + 14, bandY + 14, fitText(`${row.pos}. ${row.name}`, colWidth - 28, 28), text);
        const lineColor = rowColorMap.get(String(row.id || row.name || ((groupIdx * maxColsPerRow) + i))) || getChartSeriesColor({color:row.color}, (groupIdx * maxColsPerRow) + i);
        rr(x + 14, bandY + 56, colWidth - 28, 8, 4, lineColor);
        txt(`Bestzeit ${row.best}`, x + 14, bandY + 72, '700 20px monospace', accent);
        txt(`${row.lapCount} Runden`, x + 14, bandY + 96, '400 15px sans-serif', muted);
        rr(x, bandY + headerH + 12, colWidth, lapHeadH, 14, '#151922', border);
        txt('Runden', x + 14, bandY + headerH + 20, '700 18px sans-serif', text);
        for(let lapIdx=0; lapIdx<Math.max(1, maxLaps); lapIdx++){
          const y = bandY + headerH + 12 + lapHeadH + lapIdx * rowH;
          const lap = row.laps[lapIdx] || null;
          let fill = lapIdx % 2 ? '#151922' : '#12161d';
          let stroke = '';
          let color = lap ? text : muted;
          if(lap?.isBest){ fill = bestFill; stroke = bestStroke; }
          if(lap?.isBest && Number(lap?.lapMs) === Number(overallBestMs)){ fill = overallFill; stroke = overallStroke; }
          rr(x, y, colWidth, rowH - 4, 10, fill, stroke);
          txt(lap ? lap.text : `${lapIdx+1}: —`, x + 14, y + 6, '500 17px monospace', color);
        }
      }
      bandY += perBandHeight + bandGap;
    });
    txt('Session-Webhook • Summary + Rundenübersicht', margins.left + 10, height - margins.bottom + 2, '400 14px sans-serif', muted);
    return await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
  }


  async function renderRaceWebhookCompositeBlob(summary){
    const summaryBlob = await renderRaceSummaryBlob(summary);
    const lapBlob = await renderRaceLapColumnsBlob(summary);
    const summaryImg = await createImageBitmap(summaryBlob);
    const lapImg = await createImageBitmap(lapBlob);
    const width = Math.max(summaryImg.width, lapImg.width);
    const gap = 26;
    const pad = 24;
    const height = pad + summaryImg.height + gap + lapImg.height + pad;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f1218';
    ctx.fillRect(0,0,width,height);
    ctx.drawImage(summaryImg, Math.floor((width-summaryImg.width)/2), pad);
    ctx.drawImage(lapImg, Math.floor((width-lapImg.width)/2), pad + summaryImg.height + gap);
    return await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
  }


  function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve, Math.max(0, Number(ms)||0)));
  }

  function createDiscordHttpError(status, detail=''){
    const err = new Error(`Webhook ${status}${detail ? ': '+detail : ''}`);
    err.statusCode = Number(status || 0) || 0;
    err.retryable = err.statusCode === 408 || err.statusCode === 429 || err.statusCode >= 500;
    err.permanent = !err.retryable;
    return err;
  }

  function markDiscordNetworkError(err){
    if(!err) return err;
    err.network = true;
    err.retryable = true;
    err.permanent = false;
    return err;
  }

  function shouldQueueDiscordError(err){
    if(!err) return true;
    if(err.queued) return false;
    if(err.permanent) return false;
    return !!(err.retryable || err.network || navigator.onLine === false);
  }

  function getDiscordImmediateRetryDelayMs(attempt){
    const tries = Math.max(0, Number(attempt)||0);
    return [900, 2500, 6000][tries] || 6000;
  }

  function getDiscordQueueRetryDelayMs(attempts){
    const n = Math.max(0, Number(attempts)||0);
    return Math.min(15 * 60 * 1000, 30 * 1000 * Math.pow(2, Math.min(n, 5)));
  }

  function createQueuedDiscordError(job, cause){
    const err = new Error('discord_queued');
    err.queued = true;
    err.job = job || null;
    err.cause = cause || null;
    return err;
  }

  async function loadDiscordQueueJobs(){
    const db = await getAppDataDb();
    return await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_DISCORD_QUEUE_STORE], 'readonly');
      let rows = [];
      readAllFromObjectStore(tx, APP_DATA_DISCORD_QUEUE_STORE).then((items)=>{
        rows = Array.isArray(items) ? items : [];
      }).catch(reject);
      tx.oncomplete = ()=>resolve(rows);
      tx.onerror = ()=>reject(tx.error || new Error('Discord queue read failed'));
      tx.onabort = ()=>reject(tx.error || new Error('Discord queue read aborted'));
    });
  }

  async function putDiscordQueueJob(job){
    const db = await getAppDataDb();
    await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_DISCORD_QUEUE_STORE], 'readwrite');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('Discord queue write failed'));
      tx.onabort = ()=>reject(tx.error || new Error('Discord queue write aborted'));
      tx.objectStore(APP_DATA_DISCORD_QUEUE_STORE).put(job);
    });
  }

  async function deleteDiscordQueueJob(jobId){
    if(!jobId) return;
    const db = await getAppDataDb();
    await new Promise((resolve, reject)=>{
      const tx = db.transaction([APP_DATA_DISCORD_QUEUE_STORE], 'readwrite');
      tx.oncomplete = ()=>resolve();
      tx.onerror = ()=>reject(tx.error || new Error('Discord queue delete failed'));
      tx.onabort = ()=>reject(tx.error || new Error('Discord queue delete aborted'));
      tx.objectStore(APP_DATA_DISCORD_QUEUE_STORE).delete(jobId);
    });
  }

  async function enqueueDiscordJob(job){
    const queueJob = {
      id: job?.id || uid('dq'),
      kind: String(job?.kind || '').trim(),
      targetId: String(job?.targetId || '').trim(),
      webhookUrl: String(job?.webhookUrl || '').trim(),
      useThread: !!job?.useThread,
      threadName: String(job?.threadName || '').trim(),
      force: !!job?.force,
      createdAt: Number(job?.createdAt || now()),
      updatedAt: now(),
      nextAttemptAt: Number(job?.nextAttemptAt || now()),
      attempts: Math.max(0, Number(job?.attempts || 0) || 0),
      lastError: String(job?.lastError || '').trim()
    };
    await putDiscordQueueJob(queueJob);
    return queueJob;
  }

  let _discordQueueProcessing = false;
  let _discordQueueTimer = null;

  function scheduleDiscordQueueProcessing(delayMs=1500){
    if(_discordQueueTimer) clearTimeout(_discordQueueTimer);
    _discordQueueTimer = setTimeout(()=>{
      _discordQueueTimer = null;
      processDiscordQueue(false).catch(()=>{});
    }, Math.max(0, Number(delayMs)||0));
  }




  function buildDiscordThreadName(baseName, ctx={}, templateOverride=''){
    const tplRaw = String(templateOverride || state.settings?.discordThreadName || '').trim();
    const track = String(ctx.track || '').trim() || 'Strecke';
    const mode = String(ctx.mode || '').trim() || 'Session';
    const sessionName = String(ctx.sessionName || '').trim() || mode;
    const type = String(ctx.type || mode || baseName || 'Beitrag').trim() || 'Beitrag';
    const season = String(ctx.season || '').trim() || 'Saison';
    const raceDay = String(ctx.raceDay || '').trim() || 'Renntag';
    const date = (()=>{ try{ return new Date(ctx.endedAt || ctx.createdAt || Date.now()).toLocaleDateString('de-DE'); }catch{ return '—'; } })();
    const time = (()=>{ try{ return new Date(ctx.endedAt || ctx.createdAt || Date.now()).toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' }); }catch{ return '00:00'; } })();
    const tpl = tplRaw || '{track}, {date} {time}';
    const out = tpl
      .replaceAll('{track}', track)
      .replaceAll('{mode}', mode)
      .replaceAll('{session}', sessionName)
      .replaceAll('{type}', type)
      .replaceAll('{season}', season)
      .replaceAll('{renntag}', raceDay)
      .replaceAll('{date}', date)
      .replaceAll('{time}', time)
      .trim();
    return (out || baseName || 'TimTime Session').slice(0,100);
  }

  function trimDiscordFieldValue(value, max=1024){
    const txt = String(value || '').trim();
    if(txt.length <= max) return txt || '—';
    return (txt.slice(0, Math.max(1, max-1)).trimEnd() + '…').slice(0,max);
  }

  function chunkDiscordFieldLines(lines, titleBase, maxLen=1024){
    const out = [];
    let buf = [];
    let current = '';
    let idx = 1;
    for(const line of (lines||[])){
      const lineTxt = String(line||'').trim();
      if(!lineTxt) continue;
      const candidate = current ? `${current}\n${lineTxt}` : lineTxt;
      if(candidate.length > maxLen && current){
        out.push({ name: idx===1 ? titleBase : `${titleBase} (${idx})`, value: current });
        idx += 1;
        current = lineTxt;
      }else{
        current = candidate;
      }
    }
    if(current) out.push({ name: idx===1 ? titleBase : `${titleBase} (${idx})`, value: current });
    return out;
  }

  async function postDiscordWebhook(webhookUrl, payload, extra={}){
    const url = String(webhookUrl || '').trim();
    if(!url) throw new Error('Discord Webhook fehlt');
    const finalPayload = { ...(payload||{}) };
    if(extra && extra.thread_name) finalPayload.thread_name = String(extra.thread_name).slice(0,100);
    const fd = new FormData();
    if(extra && extra.fileBlob){ fd.append('files[0]', extra.fileBlob, sanitizeDiscordFilename(extra.filename||'summary.png')); }
    fd.append('payload_json', JSON.stringify(finalPayload));
    let res;
    try{
      res = await fetch(url, { method:'POST', body:fd });
    }catch(err){
      throw markDiscordNetworkError(err instanceof Error ? err : new Error(String(err || 'Discord fetch failed')));
    }
    if(!res.ok){
      let detail = '';
      try{ detail = await res.text(); }catch{}
      throw createDiscordHttpError(res.status, detail);
    }
    return true;
  }

  async function postDiscordWebhookWithImage(webhookUrl, payload, blob, filename, extra={}){
    let lastError = null;
    for(let attempt=0; attempt<3; attempt++){
      try{
        return await postDiscordWebhook(webhookUrl, payload, { ...(extra||{}), fileBlob: blob, filename });
      }catch(err){
        lastError = err;
        if(!(err?.retryable || err?.network) || attempt >= 2) throw err;
        await sleep(getDiscordImmediateRetryDelayMs(attempt));
      }
    }
    throw lastError || new Error('Discord send failed');
  }

  function getRaceDayBestLapsByTrack(raceDayId){
    const rd = (state.raceDay?.raceDays||[]).find(x=>x.id===raceDayId) || null;
    if(!rd) return [];
    const allLaps = state.session.laps || [];
    const raceIds = new Set((rd.races||[]).map(r=>r.id));
    const byTrack = new Map();
    for(const lap of allLaps){
      if(!raceIds.has(lap?.raceId)) continue;
      const ms = Number(lap?.lapMs||0);
      if(!(ms>0)) continue;
      const tid = String(lap?.trackId || '').trim();
      if(!tid) continue;
      const did = String(lap?.driverId || (lap?.carId ? (getCar(lap.carId)?.driverId||'') : '') || '').trim();
      if(!did) continue;
      let trackMap = byTrack.get(tid);
      if(!trackMap){ trackMap = new Map(); byTrack.set(tid, trackMap); }
      const prev = trackMap.get(did);
      if(!prev || ms < prev.bestMs){
        trackMap.set(did, {
          driverId: did,
          driverName: getDriver(did)?.name || lap?.driverName || '—',
          bestMs: ms,
          lapId: lap?.id || '',
          raceId: lap?.raceId || '',
          raceName: getRaceById(lap?.raceId)?.name || ''
        });
      }
    }
    const out = [];
    for(const [trackId, map] of byTrack.entries()){
      const track = getTrackById(trackId) || null;
      const rows = Array.from(map.values()).sort((a,b)=>(a.bestMs-b.bestMs)||((a.driverName||'').localeCompare(b.driverName||'','de')));
      out.push({ trackId, trackName: getTrackPlainName(track) || 'Strecke', trackDisplayName: formatTrackDisplayName(track || {id:trackId,name:getTrackPlainName(track)||trackId,setup:{}}), rows });
    }
    out.sort((a,b)=>(a.trackDisplayName||a.trackName).localeCompare((b.trackDisplayName||b.trackName),'de'));
    return out;
  }

  function getRaceDayWebhookTableData(raceDayId){
    const rd = (state.raceDay?.raceDays||[]).find(x=>x.id===raceDayId) || null;
    if(!rd) throw new Error('Renntag nicht gefunden');
    const races = (rd.races||[]).slice();
    const tracks = getRaceDayBestLapsByTrack(raceDayId);
    const driverStats = getDriverAggregateStatsForRaces(races);
    const maxPos = Math.max(3,
      ...driverStats.map(row=>Math.max(0, ...(row.positions||[]))),
      ...races.map(r=>computeDriverStandingsGlobal(getRelevantRaceLaps(r.id, state.session.laps||[])).length)
    );
    const placementHeaders = Array.from({length:maxPos}, (_,i)=>`${i+1}.`);
    const table1Rows = driverStats.map(row=>({
      driverId: row.driver.id,
      driverName: row.driver.name || '—',
      cells: tracks.map(group=>{
        const ms = Number(row.bestByTrack?.[group.trackId]);
        return Number.isFinite(ms) && ms>0 ? msToTime(ms,3) : '—';
      })
    }));
    const table2Rows = driverStats.map(row=>({
      driverId: row.driver.id,
      driverName: row.driver.name || '—',
      placeCounts: placementHeaders.map((_,idx)=>Number(row[`p${idx+1}`]||0)),
      bestDayMs: (()=>{
        const vals = Object.values(row.bestByTrack||{}).map(v=>Number(v)).filter(v=>Number.isFinite(v)&&v>0);
        return vals.length ? Math.min(...vals) : null;
      })(),
      fastestLapCount: Number(row.fastestLapCount||0)
    }));
    const createdAt = rd.createdAt || Date.now();
    return { rd, races, tracks, driverStats, placementHeaders, table1Rows, table2Rows, createdAt };
  }

  async function renderRaceDayWebhookBlob(raceDayId){
    const data = getRaceDayWebhookTableData(raceDayId);
    const { rd, tracks, placementHeaders, table1Rows, table2Rows, createdAt } = data;
    const width = 1800;
    const margins = { left: 36, right: 36, top: 30, bottom: 30 };
    const gap = 24;
    const titleH = 118;
    const panelGap = 22;
    const driverColW = 220;
    const minTrackColW = 150;
    const statColW = 86;
    const bestColW = 150;
    const fastestColW = 118;
    const table1TrackW = tracks.length ? Math.max(minTrackColW, Math.floor((width - margins.left - margins.right - driverColW) / Math.max(1, tracks.length))) : minTrackColW;
    const table1Cols = [driverColW].concat(tracks.map(()=>table1TrackW));
    const table1H = 66 + 42 + Math.max(1, table1Rows.length) * 34;
    const table2Cols = [driverColW].concat(placementHeaders.map(()=>statColW), [bestColW, fastestColW]);
    const table2H = 66 + 42 + Math.max(1, table2Rows.length) * 34;
    const height = margins.top + titleH + panelGap + table1H + gap + table2H + margins.bottom;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218', panel='#181c24', panel2='#1d222c', text='#eff3f8', muted='#a5afbe', border='#2a3342', header='#202633', accent='#5e97ff', bestFill='#183221', bestStroke='#2ed17d';
    function rr(x,y,w,h,r,fill,stroke=''){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); if(fill){ ctx.fillStyle=fill; ctx.fill(); } if(stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1; ctx.stroke(); } }
    function txt(str,x,y,font,color,align='left'){ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='top'; ctx.fillText(String(str||''),x,y); }
    function fitText(str,maxWidth,startPx,weight='700'){ let px=startPx; for(; px>=12; px-=1){ ctx.font=`${weight} ${px}px sans-serif`; if(ctx.measureText(String(str||'')).width<=maxWidth) break; } return `${weight} ${px}px sans-serif`; }
    function drawTable(panelX, panelY, panelW, panelH, title, subtitle, columns, headerLabels, rows, rowRenderer){
      rr(panelX, panelY, panelW, panelH, 24, panel, border);
      txt(title, panelX + 22, panelY + 18, '700 28px sans-serif', text);
      txt(subtitle, panelX + panelW - 22, panelY + 22, '400 16px sans-serif', muted, 'right');
      let x = panelX;
      const headY = panelY + 66;
      columns.forEach((w, idx)=>{
        rr(x, headY, w, 42, idx===0?16:10, header, border);
        txt(headerLabels[idx]||'', x + (idx===0?14:w/2), headY + 10, fitText(headerLabels[idx]||'', w-18, 18, '700'), text, idx===0?'left':'center');
        x += w;
      });
      let y = headY + 42;
      rows.forEach((row, rowIdx)=>{ rowRenderer({ row, rowIdx, y, panelX, columns }); y += 34; });
      if(!rows.length) txt('Keine Daten', panelX + 20, headY + 54, '500 18px sans-serif', muted);
    }

    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);
    for(let i=0;i<width;i+=92){ ctx.strokeStyle='rgba(255,255,255,0.03)'; ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i-220,height); ctx.stroke(); }
    rr(margins.left, margins.top, width - margins.left - margins.right, titleH, 26, panel, border);
    txt('TimTime Renntag-Auswertung', margins.left + 28, margins.top + 24, '700 42px sans-serif', text);
    txt(rd?.name || 'Renntag', margins.left + 28, margins.top + 74, '500 22px sans-serif', muted);
    txt(`${new Date(createdAt).toLocaleDateString('de-DE')} • ${tracks.length} Strecke${tracks.length===1?'':'n'} • ${table1Rows.length} Fahrer`, width - margins.right - 28, margins.top + 30, '500 20px sans-serif', muted, 'right');
    txt('1) Schnellste Runde je Fahrer und Strecke • 2) Wie oft Platz 1, 2, 3 … plus schnellste Rennrunde', width - margins.right - 28, margins.top + 74, '400 16px sans-serif', accent, 'right');

    const panelX = margins.left;
    const panelW = width - margins.left - margins.right;
    let curY = margins.top + titleH + panelGap;
    drawTable(panelX, curY, panelW, table1H, 'Bestzeiten je gefahrene Strecke', 'Fahrer links • pro Strecke die schnellste Runde', table1Cols, ['Fahrer', ...tracks.map(t=>t.trackDisplayName || t.trackName)], table1Rows, ({row,rowIdx,y,panelX,columns})=>{
      let x = panelX;
      const band = rowIdx % 2 ? panel2 : '#151922';
      columns.forEach((w, idx)=>{ rr(x, y, w, 34, idx===0?12:8, band, border); x += w; });
      x = panelX;
      txt(row.driverName, x + 14, y + 8, fitText(row.driverName, columns[0]-20, 18), text); x += columns[0];
      row.cells.forEach((cell, idx)=>{
        const topRow = tracks[idx]?.rows?.[0] || null;
        const isBest = cell !== '—' && topRow && topRow.driverId === row.driverId;
        if(isBest) rr(x+4, y+4, columns[idx+1]-8, 26, 8, bestFill, bestStroke);
        txt(cell, x + columns[idx+1]/2, y + 8, '700 16px monospace', cell==='—'?muted:text, 'center');
        x += columns[idx+1];
      });
    });
    curY += table1H + gap;
    drawTable(panelX, curY, panelW, table2H, 'Platzierungen und schnellste Rennrunden', 'Wie oft Platz 1, 2, 3 … plus Tagesbestzeit und Anzahl schnellster Rennrunden', table2Cols, ['Fahrer', ...placementHeaders, 'Bestzeit', 'SR'], table2Rows, ({row,rowIdx,y,panelX,columns})=>{
      let x = panelX;
      const band = rowIdx % 2 ? panel2 : '#151922';
      columns.forEach((w, idx)=>{ rr(x, y, w, 34, idx===0?12:8, band, border); x += w; });
      x = panelX;
      txt(row.driverName, x + 14, y + 8, fitText(row.driverName, columns[0]-20, 18), text); x += columns[0];
      row.placeCounts.forEach((val, idx)=>{ txt(val, x + columns[idx+1]/2, y + 8, '700 16px monospace', val?text:muted, 'center'); x += columns[idx+1]; });
      txt(row.bestDayMs!=null ? msToTime(row.bestDayMs,3) : '—', x + columns[columns.length-2]/2, y + 8, '700 16px monospace', row.bestDayMs!=null?text:muted, 'center'); x += columns[columns.length-2];
      txt(row.fastestLapCount, x + columns[columns.length-1]/2, y + 8, '700 16px monospace', row.fastestLapCount?accent:muted, 'center');
    });
    return await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
  }

  async function renderSeasonWebhookBlob(seasonId){
    const season = (state.season?.seasons||[]).find(x=>x.id===seasonId) || null;
    if(!season) throw new Error('Saison nicht gefunden');
    const champ = getChampionshipData(seasonId, getChampionshipSettings());
    const stats = getSeasonStatisticsData(seasonId);
    const createdAt = season.createdAt || Date.now();
    const width = 1800;
    const margins = { left:36, right:36, top:30, bottom:30 };
    const titleH = 126;
    const sectionGap = 24;
    const cardGap = 18;
    const cardCols = 4;
    const cardW = Math.floor((width - margins.left - margins.right - (cardGap * (cardCols - 1))) / cardCols);
    const cardH = 124;
    const tableTopRows = (champ.rows||[]).slice(0, 10);
    const statTopRows = (stats.rows||[]).slice(0, 10);
    const champCols = [70, 360, 150, 150, 120, 120, 120];
    const statCols = [70, 360, 110, 110, 110, 120, 180];
    const tableHeaderH = 42;
    const tableRowH = 34;
    const tableTitleH = 64;
    const champTableH = tableTitleH + tableHeaderH + Math.max(1, tableTopRows.length) * tableRowH;
    const statTableH = tableTitleH + tableHeaderH + Math.max(1, statTopRows.length) * tableRowH;
    const height = margins.top + titleH + sectionGap + cardH + sectionGap + champTableH + sectionGap + statTableH + margins.bottom;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const bg = '#0f1218';
    const panel = '#181c24';
    const panel2 = '#1d222c';
    const text = '#eff3f8';
    const muted = '#a5afbe';
    const border = '#2a3342';
    const header = '#202633';
    const accent = '#7d5cff';
    const accent2 = '#4ea1ff';
    const positive = '#2ed17d';
    const totalDiscardedRacePoints = (champ.rows||[]).reduce((sum, row)=>sum + (Number(row.discardedRacePoints)||0), 0);
    const totalDiscardedBonusPoints = (champ.rows||[]).reduce((sum, row)=>sum + (Number(row.discardedBonusPoints)||0), 0);
    const champLeader = champ.rows?.[0] || null;
    const winsLeader = (stats.rows||[]).slice().sort((a,b)=>(b.wins-a.wins)||(b.podiums-a.podiums))[0] || null;
    const podiumLeader = (stats.rows||[]).slice().sort((a,b)=>(b.podiums-a.podiums)||(b.wins-a.wins))[0] || null;
    const fastestLeader = (stats.rows||[]).slice().sort((a,b)=>(b.fastestLapCount-a.fastestLapCount)||(b.wins-a.wins))[0] || null;
    const rr = (x,y,w,h,r,fill,stroke='')=>{
      ctx.beginPath();
      ctx.moveTo(x+r,y);
      ctx.arcTo(x+w,y,x+w,y+h,r);
      ctx.arcTo(x+w,y+h,x,y+h,r);
      ctx.arcTo(x,y+h,x,y,r);
      ctx.arcTo(x,y,x+w,y,r);
      ctx.closePath();
      if(fill){ ctx.fillStyle = fill; ctx.fill(); }
      if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
    };
    const txt = (str,x,y,font,color,align='left')=>{
      ctx.font = font;
      ctx.fillStyle = color;
      ctx.textAlign = align;
      ctx.textBaseline = 'top';
      ctx.fillText(String(str||''), x, y);
    };
    const fitText = (str,maxWidth,startPx,weight='700')=>{
      let px = startPx;
      for(; px>=12; px-=1){
        ctx.font = `${weight} ${px}px sans-serif`;
        if(ctx.measureText(String(str||'')).width <= maxWidth) break;
      }
      return `${weight} ${px}px sans-serif`;
    };
    const drawMetricCard = (x, y, label, value, sub, accentColor)=>{
      rr(x, y, cardW, cardH, 22, panel, border);
      txt(label, x + 18, y + 16, '600 16px sans-serif', muted);
      txt(value, x + 18, y + 48, fitText(value, cardW - 36, 30, '700'), text);
      txt(sub, x + 18, y + 88, '500 15px sans-serif', accentColor || accent);
    };
    const drawTable = (y, title, subtitle, cols, headers, rows, rowRenderer)=>{
      const panelX = margins.left;
      const panelW = width - margins.left - margins.right;
      const tableH = tableTitleH + tableHeaderH + Math.max(1, rows.length) * tableRowH;
      rr(panelX, y, panelW, tableH, 24, panel, border);
      txt(title, panelX + 22, y + 18, '700 28px sans-serif', text);
      txt(subtitle, panelX + panelW - 22, y + 22, '400 16px sans-serif', muted, 'right');
      let x = panelX;
      const headY = y + tableTitleH;
      cols.forEach((w, idx)=>{
        rr(x, headY, w, tableHeaderH, idx===0?16:10, header, border);
        txt(headers[idx] || '', x + (idx===1 ? 14 : w/2), headY + 10, fitText(headers[idx] || '', w - 18, 18, '700'), text, idx===1 ? 'left' : 'center');
        x += w;
      });
      let rowY = headY + tableHeaderH;
      rows.forEach((row, rowIdx)=>{
        rowRenderer({ row, rowIdx, y:rowY, panelX, cols });
        rowY += tableRowH;
      });
      if(!rows.length) txt('Keine Daten', panelX + 20, headY + 54, '500 18px sans-serif', muted);
      return tableH;
    };

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    for(let i=0;i<width;i+=92){
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.beginPath();
      ctx.moveTo(i,0);
      ctx.lineTo(i-220,height);
      ctx.stroke();
    }
    rr(margins.left, margins.top, width - margins.left - margins.right, titleH, 26, panel, border);
    txt('TimTime Saison-Auswertung', margins.left + 28, margins.top + 24, '700 42px sans-serif', text);
    txt(season.name || 'Saison', margins.left + 28, margins.top + 76, '500 22px sans-serif', muted);
    txt(`${new Date(createdAt).toLocaleDateString('de-DE')} - ${getRaceDaysForSeason(seasonId).length} Renntage - ${stats.races.length} Rennen - ${stats.rows.length} Fahrer`, width - margins.right - 28, margins.top + 30, '500 20px sans-serif', muted, 'right');
    txt(`Wertung: ${champ.settings.countedRaces || 'alle'} Rennen - ${champ.settings.countedFastestLaps || 'alle'} SR - Faktor ${champ.settings.factor} - ${champ.settings.fastestLapPoints} SR-Pkt.`, width - margins.right - 28, margins.top + 76, '400 16px sans-serif', accent2, 'right');

    const cardsY = margins.top + titleH + sectionGap;
    drawMetricCard(margins.left, cardsY, 'Meisterschaft', champLeader ? champLeader.driver.name : '-', champLeader ? `${champLeader.totalPoints} Punkte` : 'Keine Daten', accent);
    drawMetricCard(margins.left + (cardW + cardGap), cardsY, 'Meiste Siege', winsLeader ? winsLeader.driver.name : '-', winsLeader ? `${winsLeader.wins} Siege` : 'Keine Daten', accent2);
    drawMetricCard(margins.left + ((cardW + cardGap) * 2), cardsY, 'Meiste Podien', podiumLeader ? podiumLeader.driver.name : '-', podiumLeader ? `${podiumLeader.podiums} Podien` : 'Keine Daten', positive);
    drawMetricCard(margins.left + ((cardW + cardGap) * 3), cardsY, 'Meiste SR', fastestLeader ? fastestLeader.driver.name : '-', fastestLeader ? `${fastestLeader.fastestLapCount} schnellste Runden` : 'Keine Daten', '#f59e0b');

    let curY = cardsY + cardH + sectionGap;
    curY += drawTable(curY, 'Gesamtwertung', `Gestrichen: Rennen ${totalDiscardedRacePoints} - Bonus ${totalDiscardedBonusPoints}`, champCols, ['#', 'Fahrer', 'Gesamt', 'Rennen', 'Bonus', 'Siege', 'Podien'], tableTopRows, ({row,rowIdx,y,panelX,cols})=>{
      let x = panelX;
      const band = rowIdx % 2 ? panel2 : '#151922';
      cols.forEach((w, idx)=>{ rr(x, y, w, tableRowH, idx===0?12:8, band, border); x += w; });
      x = panelX;
      txt(rowIdx + 1, x + cols[0]/2, y + 8, '700 16px sans-serif', text, 'center'); x += cols[0];
      txt(row.driver?.name || '-', x + 14, y + 8, fitText(row.driver?.name || '-', cols[1] - 20, 18), text); x += cols[1];
      txt(row.totalPoints || 0, x + cols[2]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[2];
      txt(row.countedRacePoints || 0, x + cols[3]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[3];
      txt(row.countedBonusPoints || 0, x + cols[4]/2, y + 8, '700 16px monospace', accent2, 'center'); x += cols[4];
      txt(row.wins || 0, x + cols[5]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[5];
      txt(row.podiums || 0, x + cols[6]/2, y + 8, '700 16px monospace', text, 'center');
    });
    curY += sectionGap;
    drawTable(curY, 'Saison Statistik', 'Starts, Siege, Podien, schnellste Runden und Durchschnittsplatz', statCols, ['#', 'Fahrer', 'Starts', 'Siege', 'Podien', 'SR', 'Ø Platz'], statTopRows, ({row,rowIdx,y,panelX,cols})=>{
      let x = panelX;
      const band = rowIdx % 2 ? panel2 : '#151922';
      cols.forEach((w, idx)=>{ rr(x, y, w, tableRowH, idx===0?12:8, band, border); x += w; });
      x = panelX;
      txt(rowIdx + 1, x + cols[0]/2, y + 8, '700 16px sans-serif', text, 'center'); x += cols[0];
      txt(row.driver?.name || '-', x + 14, y + 8, fitText(row.driver?.name || '-', cols[1] - 20, 18), text); x += cols[1];
      txt(row.races || 0, x + cols[2]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[2];
      txt(row.wins || 0, x + cols[3]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[3];
      txt(row.podiums || 0, x + cols[4]/2, y + 8, '700 16px monospace', text, 'center'); x += cols[4];
      txt(row.fastestLapCount || 0, x + cols[5]/2, y + 8, '700 16px monospace', accent2, 'center'); x += cols[5];
      const avgPos = row.avgPos!=null ? String(row.avgPos.toFixed(2)).replace('.', ',') : '-';
      txt(avgPos, x + cols[6]/2, y + 8, '700 16px monospace', row.avgPos!=null ? text : muted, 'center');
    });
    return await new Promise(resolve=>canvas.toBlob(resolve, 'image/png'));
  }

  function buildRaceDayWebhookMessage(raceDayId){
    const data = getRaceDayWebhookTableData(raceDayId);
    const { rd, tracks, createdAt, table1Rows } = data;
    const embeds = [{
      title: 'Renntag-Auswertung',
      description: trimDiscordFieldValue(`${rd.name || '—'}\n${tracks.length} Strecke${tracks.length===1?'':'n'} • ${table1Rows.length} Fahrer`, 4096),
      color: 0x4ea1ff,
      fields: [
        { name:'Inhalt', value: trimDiscordFieldValue(`1) Schnellste Runde je Fahrer und Strecke\n2) Wie oft Platz 1, 2, 3 …\n3) Wie oft schnellste Rennrunde`, 1024), inline:false }
      ],
      footer: { text:'TimTime Renntag Webhook' },
      timestamp: new Date(createdAt).toISOString(),
      image: { url:'attachment://renntag_auswertung.png' }
    }];
    const forumText = [`🏁 **Renntag-Auswertung**`,`**Renntag:** ${rd.name || '—'}`,`**Datum:** ${new Date(createdAt).toLocaleDateString('de-DE')}`,`**Strecken:** ${tracks.map(t=>t.trackDisplayName || t.trackName).join(', ') || '—'}`].join('\n');
    const payload = { username: state.settings?.appName || 'TimTime', content:'', embeds };
    const threadName = buildDiscordThreadName(rd.name || 'Renntag', { type:'Renntag-Auswertung', raceDay: rd.name || 'Renntag', track: tracks[0]?.trackDisplayName || 'Strecke', createdAt }, state.settings?.discordRaceDayThreadName || '');
    return { payload, forumText, threadName, raceDay: rd, tracks, tableData:data };
  }

  function buildSeasonWebhookMessage(seasonId){
    const season = (state.season?.seasons||[]).find(x=>x.id===seasonId) || null;
    if(!season) throw new Error('Saison nicht gefunden');
    const champ = getChampionshipData(seasonId, getChampionshipSettings());
    const stats = getSeasonStatisticsData(seasonId);
    const createdAt = season.createdAt || Date.now();
    const topRows = champ.rows.slice(0,20);
    const awards = [];
    if(stats.rows.length){
      const winsLeader = stats.rows.slice().sort((a,b)=>(b.wins-a.wins)||(b.podiums-a.podiums))[0];
      const podiumLeader = stats.rows.slice().sort((a,b)=>(b.podiums-a.podiums)||(b.wins-a.wins))[0];
      const fastestLeader = stats.rows.slice().sort((a,b)=>(b.fastestLapCount-a.fastestLapCount)||(b.wins-a.wins))[0];
      const consistencyLeader = stats.rows.filter(x=>x.races>1).slice().sort((a,b)=>(a.consistencyScore??9e15)-(b.consistencyScore??9e15))[0] || stats.rows[0];
      if(winsLeader) awards.push(`Meiste Siege: ${winsLeader.driver.name} (${winsLeader.wins})`);
      if(podiumLeader) awards.push(`Meiste Podien: ${podiumLeader.driver.name} (${podiumLeader.podiums})`);
      if(fastestLeader) awards.push(`Meiste schnellste Runden: ${fastestLeader.driver.name} (${fastestLeader.fastestLapCount})`);
      if(consistencyLeader && consistencyLeader.avgPos!=null) awards.push(`Konstantester Fahrer: ${consistencyLeader.driver.name} (Ø Platz ${String(consistencyLeader.avgPos.toFixed(2)).replace('.',',')})`);
    }
    const standingsLines = topRows.map((row, idx)=>{
      const pieces = [
        `${idx+1}. ${row.driver.name}`,
        `${row.totalPoints} Pkt.`,
        `${row.wins} Siege`,
        `${row.podiums} Podien`,
        `${row.fastestLapCount} SR`
      ];
      return pieces.join(' • ');
    });
    const textLines = [
      `🏆 **Saison-Auswertung**`,
      `**Saison:** ${season.name || '—'}`,
      `**Renntage:** ${getRaceDaysForSeason(seasonId).length}`,
      `**Rennen:** ${stats.races.length}`,
      `**Fahrer:** ${stats.rows.length}`,
      '',
      '**Gesamtwertung**',
      ...(standingsLines.length ? standingsLines : ['— Keine gewerteten Rennen']),
      '',
      '**Awards**',
      ...(awards.length ? awards : ['— Keine Daten'])
    ];
    const embeds = [{
      title: 'Saison-Auswertung',
      description: trimDiscordFieldValue(`${season.name || '—'}\nKomplette Saisonstatistik`, 4096),
      color: 0x7d5cff,
      fields: [
        { name:'Überblick', value: trimDiscordFieldValue(`Renntage: ${getRaceDaysForSeason(seasonId).length}\nRennen: ${stats.races.length}\nFahrer: ${stats.rows.length}\nGewertete Rennen: ${champ.races.length}`), inline:true },
        { name:'Punkte-Regel', value: trimDiscordFieldValue(`Gewertete Rennen: ${champ.settings.countedRaces || 'alle'}\nGewertete SR: ${champ.settings.countedFastestLaps || 'alle'}\nFaktor: ${champ.settings.factor}\nSR-Punkte: ${champ.settings.fastestLapPoints}`), inline:true }
      ],
      footer: { text:'TimTime Saison Webhook' },
      timestamp: new Date(createdAt).toISOString(),
      image: { url:'attachment://saison_auswertung.png' }
    }];
    const standingFields = chunkDiscordFieldLines(standingsLines, 'Gesamtwertung', 1024);
    const awardFields = chunkDiscordFieldLines(awards, 'Awards', 1024);
    for(const field of [...standingFields, ...awardFields]){
      if(embeds[embeds.length-1].fields.length >= 24){
        embeds.push({ title:'Saison-Auswertung (Fortsetzung)', color:0x7d5cff, fields:[], footer:{ text:'TimTime Saison Webhook' }, timestamp:new Date(createdAt).toISOString() });
      }
      embeds[embeds.length-1].fields.push(field);
    }
    const payload = {
      username: state.settings?.appName || 'TimTime',
      content: '',
      embeds
    };
    const forumText = textLines.join('\n').trim();
    const threadName = buildDiscordThreadName(season.name || 'Saison', {
      type: 'Saison-Auswertung', season: season.name || 'Saison', createdAt
    }, state.settings?.discordSeasonThreadName || '');
    return { payload, forumText, threadName, season, champ, stats };
  }

  function buildSeasonWebhookMessage(seasonId){
    const season = (state.season?.seasons||[]).find(x=>x.id===seasonId) || null;
    if(!season) throw new Error('Saison nicht gefunden');
    const champ = getChampionshipData(seasonId, getChampionshipSettings());
    const stats = getSeasonStatisticsData(seasonId);
    const createdAt = season.createdAt || Date.now();
    const topRows = champ.rows.slice(0,20);
    const statRows = stats.rows || [];
    const champRows = champ.rows || [];
    const champLeader = champRows[0] || null;
    const winsLeader = statRows.slice().sort((a,b)=>(b.wins-a.wins)||(b.podiums-a.podiums))[0] || null;
    const podiumLeader = statRows.slice().sort((a,b)=>(b.podiums-a.podiums)||(b.wins-a.wins))[0] || null;
    const fastestLeader = statRows.slice().sort((a,b)=>(b.fastestLapCount-a.fastestLapCount)||(b.wins-a.wins))[0] || null;
    const consistencyLeader = statRows.filter(x=>x.races>1).slice().sort((a,b)=>(a.consistencyScore??9e15)-(b.consistencyScore??9e15))[0] || statRows[0] || null;
    const startsLeader = statRows.slice().sort((a,b)=>(b.races-a.races)||(b.wins-a.wins))[0] || null;
    const avgLapLeader = statRows.filter(x=>x.avgMs!=null).slice().sort((a,b)=>(a.avgMs??9e15)-(b.avgMs??9e15)||(b.wins-a.wins))[0] || null;
    const champRaceLeader = champRows.slice().sort((a,b)=>(b.countedRacePoints-a.countedRacePoints)||(b.wins-a.wins))[0] || null;
    const champBonusLeader = champRows.slice().sort((a,b)=>(b.countedBonusPoints-a.countedBonusPoints)||(b.fastestLapCount-a.fastestLapCount))[0] || null;
    const totalDiscardedRacePoints = champRows.reduce((sum, row)=>sum + (Number(row.discardedRacePoints)||0), 0);
    const totalDiscardedBonusPoints = champRows.reduce((sum, row)=>sum + (Number(row.discardedBonusPoints)||0), 0);
    const awards = [];
    if(statRows.length){
      if(winsLeader) awards.push(`Meiste Siege: ${winsLeader.driver.name} (${winsLeader.wins})`);
      if(podiumLeader) awards.push(`Meiste Podien: ${podiumLeader.driver.name} (${podiumLeader.podiums})`);
      if(fastestLeader) awards.push(`Meiste schnellste Runden: ${fastestLeader.driver.name} (${fastestLeader.fastestLapCount})`);
      if(consistencyLeader && consistencyLeader.avgPos!=null) awards.push(`Konstantester Fahrer: ${consistencyLeader.driver.name} (Ø Platz ${String(consistencyLeader.avgPos.toFixed(2)).replace('.',',')})`);
      if(startsLeader) awards.push(`Meiste Starts: ${startsLeader.driver.name} (${startsLeader.races})`);
      if(avgLapLeader && avgLapLeader.avgMs!=null) awards.push(`Beste Ø Runde: ${avgLapLeader.driver.name} (${msToTime(avgLapLeader.avgMs,3)})`);
    }
    const trackBestMap = new Map();
    for(const row of statRows){
      for(const [trackId, bestMs] of Object.entries(row.bestByTrack||{})){
        const ms = Number(bestMs||0);
        if(!(ms>0)) continue;
        const cur = trackBestMap.get(trackId);
        if(!cur || ms < cur.ms){
          trackBestMap.set(trackId, { trackId, ms, driverName: row.driver?.name || '—' });
        }
      }
    }
    const trackBestLines = Array.from(trackBestMap.values()).sort((a,b)=>{
      const ta = getTrackById(a.trackId)?.name || a.trackId;
      const tb = getTrackById(b.trackId)?.name || b.trackId;
      return ta.localeCompare(tb, 'de');
    }).map(entry=>{
      const track = getTrackById(entry.trackId);
      return `${getTrackPlainName(track)}: ${entry.driverName} (${msToTime(entry.ms,3)})`;
    });
    const seasonRaces = getSeasonScoringRaces(seasonId);
    const recentRaceLines = seasonRaces.slice(-5).map((race, idx, arr)=>{
      const laps = getRelevantRaceLaps(race.id, state.session.laps || []);
      const standings = computeDriverStandingsGlobal(laps);
      const winner = standings[0]?.name || '—';
      const fastestDid = getFastestDriverIdFromLaps(laps);
      const fastestDriver = fastestDid ? (getDriver(fastestDid)?.name || fastestDid) : '';
      const fastestLap = laps.filter(l=>{
        const did = String(l?.driverId || (l?.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim();
        return did && did===fastestDid && Number(l?.lapMs||0)>0;
      }).reduce((best, lap)=>{
        if(!best || Number(lap.lapMs||0) < Number(best.lapMs||0)) return lap;
        return best;
      }, null);
      const parts = [`${seasonRaces.length - arr.length + idx + 1}. ${race.name || 'Rennen'}`, `Sieg: ${winner}`];
      if(fastestDriver && fastestLap?.lapMs) parts.push(`SR: ${fastestDriver} (${msToTime(fastestLap.lapMs,3)})`);
      return parts.join(' • ');
    });
    const standingsLines = topRows.map((row, idx)=>{
      const pieces = [
        `${idx+1}. ${row.driver.name}`,
        `${row.totalPoints} Pkt.`,
        `${row.races || 0}/${row.countedRaceResults || 0} gew. Rennen`,
        `${row.fastestLapCount || 0}/${row.countedFastestResults || 0} gew. SR`,
        `${row.countedRacePoints || 0} Rennen`,
        `${row.countedBonusPoints || 0} Bonus`,
        `${(row.discardedRacePoints||0) + (row.discardedBonusPoints||0)} gestrichen`,
        `${row.wins} Siege`,
        `${row.podiums} Podien`,
        `${row.fastestLapCount} SR`
      ];
      return pieces.join(' • ');
    });
    const highlightLines = [
      winsLeader ? `Meiste Siege: ${winsLeader.driver.name} (${winsLeader.wins})` : '',
      podiumLeader ? `Meiste Podien: ${podiumLeader.driver.name} (${podiumLeader.podiums})` : '',
      fastestLeader ? `Meiste SR: ${fastestLeader.driver.name} (${fastestLeader.fastestLapCount})` : '',
      consistencyLeader && consistencyLeader.avgPos!=null ? `Konstantester Fahrer: ${consistencyLeader.driver.name} (Ø ${String(consistencyLeader.avgPos.toFixed(2)).replace('.',',')})` : '',
      startsLeader ? `Meiste Starts: ${startsLeader.driver.name} (${startsLeader.races})` : '',
      avgLapLeader && avgLapLeader.avgMs!=null ? `Beste Ø Runde: ${avgLapLeader.driver.name} (${msToTime(avgLapLeader.avgMs,3)})` : '',
      champRaceLeader ? `Meiste Rennpunkte: ${champRaceLeader.driver.name} (${champRaceLeader.countedRacePoints || 0})` : '',
      champBonusLeader ? `Meiste Bonuspunkte: ${champBonusLeader.driver.name} (${champBonusLeader.countedBonusPoints || 0})` : ''
    ].filter(Boolean);
    const textLines = [
      `🏆 **Saison-Auswertung**`,
      `**Saison:** ${season.name || '—'}`,
      `**Renntage:** ${getRaceDaysForSeason(seasonId).length}`,
      `**Rennen:** ${stats.races.length}`,
      `**Fahrer:** ${statRows.length}`,
      `**Gewertete Rennen:** ${champ.settings.countedRaces || 'alle'} pro Fahrer`,
      `**Gewertete SR:** ${champ.settings.countedFastestLaps || 'alle'} pro Fahrer`,
      `**Gestrichene Punkte:** Rennen ${totalDiscardedRacePoints} • Bonus ${totalDiscardedBonusPoints}`,
      `**Meisterschaft:** ${champLeader ? `${champLeader.driver.name} mit ${champLeader.totalPoints} Punkten` : '—'}`,
      '',
      '**Gesamtwertung**',
      ...(standingsLines.length ? standingsLines : ['— Keine gewerteten Rennen']),
      '',
      '**Highlights**',
      ...(highlightLines.length ? highlightLines : ['— Keine Daten']),
      '',
      '**Streckenbestzeiten**',
      ...(trackBestLines.length ? trackBestLines : ['— Keine Daten']),
      '',
      '**Letzte Rennen**',
      ...(recentRaceLines.length ? recentRaceLines : ['— Keine Daten'])
    ];
    const embeds = [{
      title: 'Saison-Auswertung',
      description: trimDiscordFieldValue(`${season.name || '—'}\nKomplette Saisonstatistik und Meisterschaftsübersicht`, 4096),
      color: 0x7d5cff,
      fields: [
        { name:'Überblick', value: trimDiscordFieldValue(`Renntage: ${getRaceDaysForSeason(seasonId).length}\nRennen: ${stats.races.length}\nFahrer: ${statRows.length}\nGewertete Rennen gesamt: ${champ.races.length}`), inline:true },
        { name:'Punkte-Regel', value: trimDiscordFieldValue(`Gewertete Rennen: ${champ.settings.countedRaces || 'alle'} pro Fahrer\nGewertete SR: ${champ.settings.countedFastestLaps || 'alle'} pro Fahrer\nFaktor: ${champ.settings.factor}\nSR-Punkte: ${champ.settings.fastestLapPoints}`), inline:true },
        { name:'Streichresultate', value: trimDiscordFieldValue(`Gestrichene Rennpunkte: ${totalDiscardedRacePoints}\nGestrichene Bonuspunkte: ${totalDiscardedBonusPoints}`), inline:true },
        { name:'Meisterschaftsführer', value: trimDiscordFieldValue(champLeader ? `${champLeader.driver.name}\n${champLeader.totalPoints} Punkte\n${champLeader.wins} Siege • ${champLeader.podiums} Podien` : '—'), inline:true }
      ],
      footer: { text:'TimTime Saison Webhook' },
      timestamp: new Date(createdAt).toISOString()
    }];
    const highlightFields = chunkDiscordFieldLines(highlightLines, 'Highlights', 1024);
    const standingFields = chunkDiscordFieldLines(standingsLines, 'Gesamtwertung', 1024);
    const awardFields = chunkDiscordFieldLines(awards, 'Awards', 1024);
    const trackFields = chunkDiscordFieldLines(trackBestLines, 'Streckenbestzeiten', 1024);
    const recentRaceFields = chunkDiscordFieldLines(recentRaceLines, 'Letzte Rennen', 1024);
    for(const field of [...highlightFields, ...standingFields, ...awardFields, ...trackFields, ...recentRaceFields]){
      if(embeds[embeds.length-1].fields.length >= 24){
        embeds.push({ title:'Saison-Auswertung (Fortsetzung)', color:0x7d5cff, fields:[], footer:{ text:'TimTime Saison Webhook' }, timestamp:new Date(createdAt).toISOString() });
      }
      embeds[embeds.length-1].fields.push(field);
    }
    const payload = {
      username: state.settings?.appName || 'TimTime',
      content: '',
      embeds
    };
    const forumText = textLines.join('\n').trim();
    const threadName = buildDiscordThreadName(season.name || 'Saison', {
      type: 'Saison-Auswertung', season: season.name || 'Saison', createdAt
    }, state.settings?.discordSeasonThreadName || '');
    return { payload, forumText, threadName, season, champ, stats };
  }

  async function sendRaceDayWebhook(raceDayId, opts={}){
    const webhookUrl = String((opts.webhookUrl ?? state.settings?.discordRaceDayWebhook) || '').trim();
    if(!webhookUrl) throw new Error('Renntag Webhook fehlt');
    const msg = buildRaceDayWebhookMessage(raceDayId);
    const useThread = opts.useThread ?? state.settings?.discordRaceDayUseThread;
    const extra = useThread ? { thread_name: (opts.threadName || msg.threadName) } : {};
    try{
      const blob = await renderRaceDayWebhookBlob(raceDayId);
      await postDiscordWebhookWithImage(webhookUrl, msg.payload, blob, 'renntag_auswertung.png', extra);
      return { queued:false, msg };
    }catch(err){
      if(opts.allowQueue !== false && shouldQueueDiscordError(err)){
        const job = await enqueueDiscordJob({
          kind:'raceday',
          targetId: raceDayId,
          webhookUrl,
          useThread: !!useThread,
          threadName: extra.thread_name || '',
          force: true,
          lastError: String(err?.message || err || '')
        });
        scheduleDiscordQueueProcessing(1500);
        throw createQueuedDiscordError(job, err);
      }
      throw err;
    }
  }

  async function sendSeasonWebhook(seasonId, opts={}){
    const webhookUrl = String((opts.webhookUrl ?? state.settings?.discordSeasonWebhook) || '').trim();
    if(!webhookUrl) throw new Error('Saison Webhook fehlt');
    const msg = buildSeasonWebhookMessage(seasonId);
    const useThread = opts.useThread ?? state.settings?.discordSeasonUseThread;
    const extra = useThread ? { thread_name: (opts.threadName || msg.threadName) } : {};
    try{
      const blob = await renderSeasonWebhookBlob(seasonId);
      await postDiscordWebhookWithImage(webhookUrl, msg.payload, blob, 'saison_auswertung.png', extra);
      return { queued:false, msg };
    }catch(err){
      if(opts.allowQueue !== false && shouldQueueDiscordError(err)){
        const job = await enqueueDiscordJob({
          kind:'season',
          targetId: seasonId,
          webhookUrl,
          useThread: !!useThread,
          threadName: extra.thread_name || '',
          force: true,
          lastError: String(err?.message || err || '')
        });
        scheduleDiscordQueueProcessing(1500);
        throw createQueuedDiscordError(job, err);
      }
      throw err;
    }
  }

  async function copyTextToClipboard(txt){
    const val = String(txt || '').trim();
    if(!val) throw new Error('Kein Text vorhanden');
    if(navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(val);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = val;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if(!ok) throw new Error('Clipboard nicht verfügbar');
    return true;
  }

  function setDiscordPreviewText(root, selector, text){
    const node = root?.querySelector(selector);
    if(node) node.textContent = String(text || '').trim() || 'Keine Daten';
  }

  function formatDiscordPayloadPreview(payload){
    const lines = [];
    const embeds = Array.isArray(payload?.embeds) ? payload.embeds : [];
    const content = String(payload?.content || '').trim();
    if(content) lines.push(content);
    embeds.forEach((embed, idx)=>{
      if(idx) lines.push('', '-----');
      if(embed?.title) lines.push(String(embed.title));
      if(embed?.description) lines.push(String(embed.description));
      for(const field of (embed?.fields || [])){
        if(field?.name) lines.push('', `[${field.name}]`);
        if(field?.value) lines.push(String(field.value));
      }
      if(embed?.footer?.text) lines.push('', `Footer: ${embed.footer.text}`);
      if(embed?.image?.url) lines.push(`Bild: ${embed.image.url}`);
    });
    return lines.join('\n').trim();
  }

  function setDiscordPreviewImage(root, selector, blob, alt){
    const node = root?.querySelector(selector);
    if(!node) return;
    const prevUrl = node.getAttribute('data-preview-url');
    if(prevUrl) URL.revokeObjectURL(prevUrl);
    node.removeAttribute('data-preview-url');
    node.innerHTML = '';
    if(!(blob instanceof Blob)){
      node.innerHTML = `<div class="muted small">${esc(alt || 'Kein Bild verfuegbar')}</div>`;
      return;
    }
    const url = URL.createObjectURL(blob);
    node.setAttribute('data-preview-url', url);
    node.innerHTML = `<img src="${url}" alt="${esc(alt || 'Discord Vorschau')}" />`;
    const img = node.querySelector('img');
    if(img){
      img.onload = ()=>setTimeout(()=>URL.revokeObjectURL(url), 1200);
    }
  }

  async function sendDiscordSummaryForRace(raceId, opts={}){
    const summary = buildRaceSummaryData(raceId);
    if(!summary) throw new Error('Session nicht gefunden');
    const race = summary.race;
    if(race.discordSentAt && !opts.force) return false;
    const webhookUrl = String((opts.webhookUrl ?? state.settings?.discordWebhook) || '').trim();
    if(!webhookUrl) throw new Error('Discord Webhook fehlt');
    const standings = summary.standings || [];
    const top = standings.slice(0,3).map((s,idx)=>`${idx+1}. ${s.name||'—'} (${s.bestMs!=null ? msToTime(s.bestMs,3) : '—'})`).join('\n') || '—';
    const bestText = summary.bestLap ? `${driverNameByIdGlobal(driverKeyForLapGlobal(summary.bestLap))} • ${msToTime(summary.bestLap.lapMs,3)}` : '—';
    const payload = {
      username: state.settings?.appName || 'TimTime',
      embeds: [{
        title: summary.freeDriving ? 'Freies Fahren beendet' : 'Rennen beendet',
        description: summary.subtitle,
        color: summary.freeDriving ? 5814783 : 5153791,
        fields: [
          { name: summary.freeDriving ? 'Top Bestzeiten' : 'Podium', value: top || '—', inline: false },
          { name:'Schnellste Runde', value: bestText, inline:true },
          { name:'Beendet', value: formatDiscordDateTime(race.endedAt), inline:true }
        ],
        image: { url: 'attachment://session_summary.png' },
        footer: { text: 'TimTime Discord Webhook' },
        timestamp: new Date(race.endedAt || Date.now()).toISOString()
      }]
    };
    const trackName = getTrackPlainName(summary.track);
    const useThread = opts.useThread ?? state.settings?.discordUseThread;
    const threadName = buildDiscordThreadName(race.name || 'Rennen', { track:trackName, mode: summary.freeDriving ? 'Freies Fahren' : 'Rennen', sessionName:race.name || 'Rennen', endedAt: race.endedAt });
    const extra = useThread ? { thread_name: (opts.threadName || threadName) } : {};
    try{
      const blob = await renderRaceWebhookCompositeBlob(summary);
      await postDiscordWebhookWithImage(webhookUrl, payload, blob, 'session_summary.png', extra);
      race.discordSentAt = now();
      race.discordSendError = '';
      saveState();
      return { queued:false, sent:true };
    }catch(err){
      race.discordSendError = String(err?.message || err || 'Unbekannter Fehler');
      saveState();
      if(opts.allowQueue !== false && shouldQueueDiscordError(err)){
        const job = await enqueueDiscordJob({
          kind:'session',
          targetId: raceId,
          webhookUrl,
          useThread: !!useThread,
          threadName: extra.thread_name || '',
          force: !!opts.force,
          lastError: race.discordSendError
        });
        scheduleDiscordQueueProcessing(1500);
        throw createQueuedDiscordError(job, err);
      }
      throw err;
    }
  }

  async function executeDiscordQueueJob(job){
    const kind = String(job?.kind || '').trim();
    if(kind==='session'){
      return await sendDiscordSummaryForRace(job.targetId, {
        force: !!job.force,
        webhookUrl: job.webhookUrl,
        useThread: !!job.useThread,
        threadName: job.threadName || '',
        allowQueue: false
      });
    }
    if(kind==='raceday'){
      return await sendRaceDayWebhook(job.targetId, {
        webhookUrl: job.webhookUrl,
        useThread: !!job.useThread,
        threadName: job.threadName || '',
        allowQueue: false
      });
    }
    if(kind==='season'){
      return await sendSeasonWebhook(job.targetId, {
        webhookUrl: job.webhookUrl,
        useThread: !!job.useThread,
        threadName: job.threadName || '',
        allowQueue: false
      });
    }
    throw new Error('Unbekannter Discord-Queue-Typ');
  }

  async function processDiscordQueue(force=false){
    if(_discordQueueProcessing) return;
    if(!force && navigator.onLine === false) return;
    _discordQueueProcessing = true;
    try{
      const jobs = (await loadDiscordQueueJobs())
        .filter(job => Number(job?.nextAttemptAt || 0) <= now())
        .sort((a,b)=>(Number(a?.nextAttemptAt || 0) - Number(b?.nextAttemptAt || 0)) || (Number(a?.createdAt || 0) - Number(b?.createdAt || 0)));
      for(const job of jobs){
        try{
          await executeDiscordQueueJob(job);
          await deleteDiscordQueueJob(job.id);
          logLine('Discord Queue gesendet: ' + String(job.kind || 'job') + ' ' + String(job.targetId || ''));
        }catch(err){
          if(shouldQueueDiscordError(err)){
            job.attempts = Math.max(0, Number(job.attempts || 0) || 0) + 1;
            job.updatedAt = now();
            job.lastError = String(err?.message || err || 'Unbekannter Fehler');
            job.nextAttemptAt = now() + getDiscordQueueRetryDelayMs(job.attempts);
            await putDiscordQueueJob(job);
            logLine('Discord Queue verschoben: ' + String(job.kind || 'job') + ' in ' + Math.round((job.nextAttemptAt - now())/1000) + 's');
          }else{
            await deleteDiscordQueueJob(job.id);
            logLine('Discord Queue verworfen: ' + String(job.kind || 'job') + ' • ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }
      }
    }finally{
      _discordQueueProcessing = false;
    }
  }

  async function buildSessionDiscordPreview(raceId){
    const summary = buildRaceSummaryData(raceId);
    if(!summary) throw new Error('Session nicht gefunden');
    const race = summary.race;
    const blob = await renderRaceWebhookCompositeBlob(summary);
    const standings = summary.standings || [];
    const top = standings.slice(0,3).map((s,idx)=>`${idx+1}. ${s.name||'â€”'} (${s.bestMs!=null ? msToTime(s.bestMs,3) : 'â€”'})`).join('\n') || 'â€”';
    const bestText = summary.bestLap ? `${driverNameByIdGlobal(driverKeyForLapGlobal(summary.bestLap))} â€¢ ${msToTime(summary.bestLap.lapMs,3)}` : 'â€”';
    const payload = {
      username: state.settings?.appName || 'TimTime',
      embeds: [{
        title: summary.freeDriving ? 'Freies Fahren beendet' : 'Rennen beendet',
        description: summary.subtitle,
        color: summary.freeDriving ? 5814783 : 5153791,
        fields: [
          { name: summary.freeDriving ? 'Top Bestzeiten' : 'Podium', value: top || 'â€”', inline: false },
          { name:'Schnellste Runde', value: bestText, inline:true },
          { name:'Beendet', value: formatDiscordDateTime(race.endedAt), inline:true }
        ],
        image: { url:'attachment://session_summary.png' },
        footer: { text:'TimTime Discord Webhook' },
        timestamp: new Date(race.endedAt || Date.now()).toISOString()
      }]
    };
    return { summary, race, payload, blob };
  }

  async function maybeAutoSendDiscordForRace(raceId){
    const race = getRaceById(raceId);
    if(!race || race.discordSentAt) return;
    if(!state.settings?.discordAutoSend) return;
    if(!String(state.settings?.discordWebhook || '').trim()) return;
    try{
      await sendDiscordSummaryForRace(raceId);
      toast('Discord','Session automatisch gesendet.','ok');
      logLine(`Discord Webhook gesendet: ${race.name||raceId}`);
    }catch(err){
      if(err?.queued){
        race.discordSendError = 'Warteschlange aktiv';
        saveState();
        toast('Discord','Session in Warteschlange. Wird automatisch erneut versucht.','warn');
        logLine('Discord Queue aktiv: Session ' + String(race.name || raceId));
        return;
      }
      race.discordSendError = String(err?.message || err || 'Unbekannter Fehler');
      saveState();
      toast('Discord','Webhook fehlgeschlagen.','err');
      logLine('Discord Webhook Fehler: ' + race.discordSendError);
    }
  }


  function buildDiscordFakeSummaryData(){
    const driverPool = (state.drivers||[]).slice(0,4);
    const names = driverPool.length ? driverPool.map(d=>d.name||'—') : ['Tim','Alex','Roland','Beegle'];
    const colors = driverPool.length ? driverPool.map(d=>d.color||'') : ['#5e97ff','#62d296','#ff835c','#d66cff'];
    const endedAt = Date.now();
    const track = getTrackById(state.session?.currentTrackId || '') || state.tracks?.[0] || null;
    const fakeRace = {
      id: uid('discord_test_'),
      name: 'Discord Test',
      mode: 'single',
      submode: 'Rennen',
      endedAt,
      trackId: track?.id || ''
    };
    const bests = [4211, 4298, 4376, 4522];
    const standings = names.map((name, idx)=>(
      { id: driverPool[idx]?.id || `fake_${idx+1}`, name, laps: Math.max(9, 12-idx), bestMs: bests[idx] || (4300 + idx*120) }
    ));
    const pointTemplates = [
      [2,2,1,1,1,1,1,1,1,1,1,1],
      [1,1,2,2,2,2,2,2,2,2,2,2],
      [3,3,3,3,3,3,3,3,3,3,3,3],
      [4,4,4,4,4,4,4,4,4,4,4,4]
    ];
    const chart = names.slice(0, Math.max(3, Math.min(4, names.length))).map((name, idx)=>(
      { name, color: colors[idx] || ['#5e97ff','#62d296','#ff835c','#d66cff'][idx%4], points: pointTemplates[idx].map((pos,i)=>({ lap:i+1, pos })) }
    ));
    return {
      raceId: fakeRace.id,
      race: fakeRace,
      laps: standings.flatMap((row, idx)=> Array.from({ length: row.laps || Math.max(9, 12-idx) }, (_, lapIdx)=>({ driverId: row.id, lapNo: lapIdx+1, lapMs: Math.round((row.bestMs||4300) + Math.random()*220 + lapIdx*6), ts: (lapIdx+1)*5000 + idx*50 }))),
      track,
      freeDriving: false,
      standings,
      top3: standings.slice(0,3),
      bestLap: { lapMs: bests[0], driverId: standings[0].id, carId: '' },
      chart,
      title: 'Rennergebnis',
      subtitle: `${getTrackPlainName(track)} • Discord Testlauf`
    };
  }

  async function sendDiscordTestWebhook(){
    const webhookUrl = String(state.settings?.discordWebhook || '').trim();
    if(!webhookUrl) throw new Error('Discord Webhook fehlt');
    const summary = buildDiscordFakeSummaryData();
    const blob = await renderRaceWebhookCompositeBlob(summary);
    const payload = {
      username: state.settings?.appName || 'TimTime',
      content: '',
      embeds: [{
        title: 'Discord Test',
        description: 'Fake-Daten für Webhook-Test',
        color: 5153791,
        fields: [
          { name:'Strecke', value:getTrackPlainName(summary.track), inline:true },
          { name:'Modus', value:'Rennen (Test)', inline:true },
          { name:'Podium', value: summary.standings.slice(0,3).map((s,idx)=>`${idx+1}. ${s.name} (${msToTime(s.bestMs,3)})`).join('\n') || '—', inline:false }
        ],
        image: { url: 'attachment://discord_test_summary.png' },
        footer: { text:'TimTime Discord Test' },
        timestamp: new Date().toISOString()
      }]
    };
    const extra = (state.settings?.discordUseThread) ? { thread_name: buildDiscordThreadName('Discord Test', { track:getTrackPlainName(summary.track), mode:'Discord Test', sessionName:'Discord Test', endedAt: summary.race?.endedAt || Date.now() }) } : {};
    await postDiscordWebhookWithImage(webhookUrl, payload, blob, 'discord_test_summary.png', extra);
    return true;
  }

  function isFreeDrivingRace(race){
    return !!(race && (race.submode==='Freies Fahren' || race.mode==='free'));
  }

  function isFreeDrivingMode(){
    return !!state.session?.isFreeDriving;
  }

  function raceShouldShowPodium(race){
    if(!race) return false;
    if(race.mode==='loop') return true;
    if(isFreeDrivingRace(race)) return false;
    return true;
  }

  function ensureCarByChip(chip){
    chip = String(chip||'').trim().toUpperCase();
    if(!chip) return null;
    let car = state.masterData.cars.find(c => (c.chipCode||'').toUpperCase()===chip);
    if(car) return car;
    car = { id: uid('car'), name:`Unbekannt (${chip})`, chipCode:chip, driverId:'' };
    state.masterData.cars.push(car);
    saveState();
    logLine(`Neues Fahrzeug erkannt: ${chip} → Stammdaten: Unbekannt`);
    toast('Fahrzeug', 'Neues Fahrzeug erkannt (unbekannt).', 'ok');
    return car;
  }

  function getDriverNameForCar(car){
    if(!car) return '';
    const d = car.driverId ? getDriver(car.driverId) : null;
    return d?.name || '';
  }

  // --------------------- Race storage ---------------------
  function syncEnduranceSettingsFromPage(){
    try{
      const durNode = document.getElementById('endDur');
      const minNode = document.getElementById('endMinStintLaps');
      const maxNode = document.getElementById('endMaxStintLaps');
      const penaltyNode = document.getElementById('endPenaltySeconds');
      const thresholdNode = document.getElementById('endPenaltyLapThresholdSeconds');
      const lapsNode = document.getElementById('endPenaltyLapsPerThreshold');
      if(durNode){
        const v = Math.max(1, parseInt(durNode.value||0,10) || 0);
        if(Number.isFinite(v) && v > 0) state.modes.endurance.durationMin = v;
      }
      if(minNode){
        state.modes.endurance.minStintLaps = Math.max(0, parseInt(minNode.value||0,10) || 0);
      }
      if(maxNode){
        state.modes.endurance.maxStintLaps = Math.max(0, parseInt(maxNode.value||0,10) || 0);
      }
      if(penaltyNode){
        state.modes.endurance.penaltySecondsPerViolation = Math.max(0, parseInt(penaltyNode.value||0,10) || 0);
      }
      if(thresholdNode){
        state.modes.endurance.penaltyLapThresholdSeconds = Math.max(0, parseInt(thresholdNode.value||0,10) || 0);
      }
      if(lapsNode){
        state.modes.endurance.penaltyLapsPerThreshold = Math.max(0, parseInt(lapsNode.value||0,10) || 0);
      }
    }catch{}
  }

  function getNormalizedEnduranceDurationMin(){
    syncEnduranceSettingsFromPage();
    return Math.max(1, parseInt(state.modes.endurance?.durationMin||30,10) || 30);
  }

  function startNewRace(){
    const rd = getActiveRaceDay();
    if(!rd) return null;
    const id = uid('race');
    const freeDriving = !!state.session?.isFreeDriving;
    const raceMode = freeDriving ? 'single' : state.modes.activeMode;
    const name = `${getModeLabel()} • ${new Date().toLocaleTimeString('de-DE',{hour12:false})}`;
    const race = {
      id, name,
      mode: raceMode,
      submode: freeDriving ? 'Freies Fahren' : (state.modes.activeMode==='single' ? state.modes.singleSubmode : ''),
      seasonId: rd.seasonId || state.season.activeSeasonId || '',
      trackId: state.tracks.activeTrackId,
      startedAt: now(),
      startedAtMrc: null,
      endedAt: null
    };
    if(raceMode==='endurance'){
      race.enduranceDurationMin = getNormalizedEnduranceDurationMin();
      race.enduranceMinStintLaps = Math.max(0, parseInt(state.modes.endurance?.minStintLaps||0,10) || 0);
      race.enduranceMaxStintLaps = Math.max(0, parseInt(state.modes.endurance?.maxStintLaps||0,10) || 0);
      race.endurancePenaltySecondsPerViolation = Math.max(0, parseInt(state.modes.endurance?.penaltySecondsPerViolation||0,10) || 0);
      race.endurancePenaltyLapThresholdSeconds = Math.max(0, parseInt(state.modes.endurance?.penaltyLapThresholdSeconds||0,10) || 0);
      race.endurancePenaltyLapsPerThreshold = Math.max(0, parseInt(state.modes.endurance?.penaltyLapsPerThreshold||0,10) || 0);
    }
    rd.races.push(race);
    state.session.currentRaceId = id;
    saveState();
    return race;
  }
  function endCurrentRace(){
    const rd = getActiveRaceDay();
    if(!rd || !state.session.currentRaceId) return;
    const currentRaceId = state.session.currentRaceId;
    const race = rd.races.find(r=>r.id===currentRaceId);
    if(race && race.mode==='endurance'){
      finalizeAllEnduranceStintsForRace(currentRaceId, now());
    }
    if(race && !race.endedAt){
      race.endedAt = now();
      if(raceShouldShowPodium(race)){
        state.ui.podiumRaceId = race.id;
        state.ui.activeTab = 'Dashboard';
        toast('Rennen beendet', 'Sieger & Ergebnisliste angezeigt.', 'ok');
      }else{
        state.ui.podiumRaceId = '';
        toast('Session beendet', 'Freies Fahren beendet.', 'ok');
      }
    }
    saveState();
    if(race && race.endedAt){ Promise.resolve().then(()=>maybeAutoSendDiscordForRace(race.id)); }
  }

  
  function endCurrentRaceQuiet(){
    const rd = getActiveRaceDay();
    if(!rd || !state.session.currentRaceId) return;
    const currentRaceId = state.session.currentRaceId;
    const race = rd.races.find(r=>r.id===currentRaceId);
    if(race && race.mode==='endurance'){
      finalizeAllEnduranceStintsForRace(currentRaceId, now());
    }
    if(race && !race.endedAt){
      race.endedAt = now();
    }
    saveState();
  }

// --------------------- Loop automation ---------------------
  function loopInit(){
    state.loopRuntime.phase = 'training';
    state.loopRuntime.remainingMs = Math.max(0, (Math.max(0, Number(state.modes.loop.trainingMin||0)) * 60_000));
    state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;
    state.loopRuntime.phaseStartedAt = getTimelineNowMs();
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
  }
  function loopAdvancePhase(){
    const phase = state.loopRuntime.phase;

    // helper to start a countdown phase
    function setPhase(p, ms){
      state.loopRuntime.phase = p;
      state.loopRuntime.remainingMs = Math.max(0, ms|0);
      state.loopRuntime.phaseStartedAt = getTimelineNowMs();
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
      state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;
      saveState();
      renderSessionControl();
      renderAll();
    }

    if(phase === 'training'){
      // 1 min setup phase before race
      const lm = readLoopMinsFromUI();
      state.modes.loop.trainingMin = lm.trainingMin;
      state.modes.loop.setupMin = lm.setupMin;
      state.modes.loop.raceMin = lm.raceMin;
      state.modes.loop.podiumMin = lm.podiumMin;
      saveState();
      setPhase('setup', Math.max(0, Number(lm.setupMin||0) * 60_000));
      state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0, state.loopRuntime.remainingMs||0)/1000);
      // reset rest-time announcement keys for setup
      try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
      logLine(`Loop Phase → AUFSTELLEN (${(state.modes.loop.setupMin||0)}min)`);
      toast('Dauerschleife','Aufstellphase: bitte Startpositionen einnehmen.','warn');
      if(state.audio?.enabled){
        queueSpeak('Bitte Startpositionen einnehmen');
      }
      return;
    }

    if(phase === 'setup'){
      // Switch into AMPEL phase immediately so we don't spam this block each tick.
      state.loopRuntime.phase = 'ampel';
      state.loopRuntime.phaseTotalSec = null;
      state.loopRuntime.phaseEndsAt = null;
      state.loopRuntime.remainingMs = null;
      state.loopRuntime.phaseStartedAt = getTimelineNowMs();
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
      saveState();
      renderAll();

      logLine('Loop Phase → AMPEL');
      toast('Dauerschleife','Ampel…','ok');

      // Run start light sequence and start the race segment exactly at GREEN.
      runAmpelSequence((greenMrcMs)=>loopStartRaceSegment(greenMrcMs));
      return;
    }

    if(phase === 'podium'){
      // After 1 minute podium, go back to training and start a fresh training segment
      state.ui.podiumRaceId = '';
      endCurrentRaceQuiet();
      resetFinishRuntime();
      state.session.lastPassByCarId = {};
    state.session.lastPassSeenByCarId = {};
      startNewRace(); // new segment for training
      setPhase('training', Math.max(0, (Math.max(0, Number(state.modes.loop.trainingMin||0)) * 60_000)));
      logLine('Loop Phase → TRAINING (neuer Zyklus)');
      toast('Dauerschleife','Zurück zu Training','ok');
      if(state.audio?.enabled){ try{ queueSpeak('Training startet'); }catch{} }
      return;
    }

    // Fallback: if something else, restart training
    setPhase('training', Math.max(0, (Math.max(0, Number(state.modes.loop.trainingMin||0)) * 60_000)));
    logLine('Loop Phase → TRAINING (fallback)');
    toast('Dauerschleife','Wechsel: Training','ok');
  }
  function loopOnPause(){
    if(!state.loopRuntime.phaseEndsAt) return;
    state.loopRuntime.remainingMs = Math.max(0, state.loopRuntime.phaseEndsAt - getTimelineNowMs());
    state.loopRuntime.phaseEndsAt = null;
    // keep elapsed for race timing
    if(state.loopRuntime.phaseStartedAt){
      state.loopRuntime.phaseElapsedMs = Math.max(0, getTimelineNowMs() - state.loopRuntime.phaseStartedAt);
    }
    saveState();
  }
  function loopOnResume(){
    if(state.loopRuntime.remainingMs==null) return;
    state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;
    if(state.loopRuntime.phaseElapsedMs!=null){
      state.loopRuntime.phaseStartedAt = getTimelineNowMs() - Math.max(0, state.loopRuntime.phaseElapsedMs);
    }
    saveState();
  }

  function loopStartRaceSegment(startMrcMs=null){
    // End any previous segment without podium
    endCurrentRaceQuiet();

    // Start a fresh race segment
    resetFinishRuntime();
    state.session.lastPassByCarId = {};
    state.session.lastPassSeenByCarId = {};
    state.session.raceStartArmedByCarId = {};
    state.session.mrcCounterByChip = {};
    const startedRace = startNewRace();
    state.loopRuntime.phase = 'race';
    state.loopRuntime.phaseStartedAt = Number.isFinite(Number(startMrcMs)) ? Math.max(0, Number(startMrcMs)) : getTimelineNowMs();
    if(startedRace){
      startedRace.startedAtMrc = state.loopRuntime.phaseStartedAt;
    }
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
    state.loopRuntime.remainingMs = Math.max(0, (Math.max(0.01, Number(state.modes.loop.raceMin||0)) * 60_000));
    state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;

    logLine('Loop Phase → RENNEN (Start bei Grün)');
    toast('Dauerschleife','Rennen gestartet','ok');
    saveState();
    renderAll();
  }


  function loopTick(){
    if(state.session.state !== 'RUNNING') return;
    if(state.modes.activeMode !== 'loop') return;

    const phase = state.loopRuntime.phase;

    // During race, if time is up, start finish window (everyone finishes lap, overtime based on first finisher)
    if(phase === 'ampel'){ return; }

    if(phase === 'race'){
      const limitMs = Math.max(0.01, Number(state.modes.loop.raceMin||0))*60_000;
      const elapsed = Math.max(0, getTimelineNowMs() - (state.loopRuntime.phaseStartedAt || state.session.startedAtMrc || getTimelineNowMs()));
      if(!state.session.finish?.pending && elapsed >= limitMs){
        beginFinishWindow('time');
        logLine('Loop: Rennzeit abgelaufen → Zielphase');
        toast('Dauerschleife','Rennzeit abgelaufen: Zielphase','warn');
      }
      return;
    }

    // For other phases: timer based switching
    if(state.loopRuntime.phaseEndsAt==null) return;
    if(getTimelineNowMs() >= state.loopRuntime.phaseEndsAt) loopAdvancePhase();
  }

  
  
  
function singleTick(){
  if(state.session.state !== 'RUNNING') return;

  // if we're in finish window, just monitor completion/deadline
  if(state.session.finish?.pending){
    finishTick();
    return;
  }

  if(state.modes.activeMode !== 'single' && !isFreeDrivingMode()) return;
  if(isFreeDrivingMode()) return;
  const fm = state.modes.single?.finishMode || 'none';
  if(fm === 'none') return;

  const rid = state.session.currentRaceId;
  if(!rid) return;

  if(fm === 'time'){
    const limitMs = Math.max(1, (state.modes.single.timeLimitSec||180)) * 1000;
    if(sessionElapsedMs() >= limitMs){
      // Start finish window: everyone finishes their current lap, then we stop.
      beginFinishWindow('time');
    }
    return;
  }

  if(fm === 'laps'){
    const limit = Math.max(1, state.modes.single.lapLimit||20);

    // Count laps per car and detect the first finisher
    const laps = state.session.laps.filter(l=>l.raceId===rid);
    const byCar = {};
    for(const l of laps){ byCar[l.carId] = (byCar[l.carId]||0) + 1; }

    let firstCarId = null;
    for(const [carId, cnt] of Object.entries(byCar)){
      if(cnt >= limit){
        firstCarId = carId;
        break;
      }
    }
    if(firstCarId){
      // We don't know exact finish timestamp of that car here; use now() and treat as first finisher.
      const ts = now();
      beginFinishWindow('laps', { firstFinishTs: ts });
      // Mark the first finisher immediately so overtime countdown starts
      markCarFinished(firstCarId, ts);
    }
  }
}



// --------------------- Startampel ---------------------
  let ampelRunning = false;

  function showAmpelOverlay(show){
    if(!state.ui) state.ui={activeTab:'Dashboard'};
    state.ui.ampel = state.ui.ampel || {visible:false, step:0, go:false, text:'—'};
    state.ui.ampel.visible = !!show;
    saveState();
    try{ renderSessionControl(); }catch{}

    const ov = document.getElementById('ampelOverlay');
    if(!ov) return;
    ov.classList.toggle('hidden', !show);
  }

  function setLampState(step, isGo){
    if(!state.ui) state.ui={activeTab:'Dashboard'};
    state.ui.ampel = state.ui.ampel || {visible:false, step:0, go:false, text:'—'};
    state.ui.ampel.step = Number(step)||0;
    state.ui.ampel.go = !!isGo;
    // no saveState here (too spammy)

    const sets = [
      ['lamp1','lamp2','lamp3','lamp4','lamp5'],
      ['lampO1','lampO2','lampO3','lampO4','lampO5'],
    ];
    for(const ids of sets){
      ids.forEach((id,i)=>{
        const el = document.getElementById(id);
        if(!el) return;
        el.classList.remove('on','go');
        if(isGo){
          if(i===4) el.classList.add('go');
        } else {
          if(i < step) el.classList.add('on');
        }
      });
    }
  }


  function setAmpelText(t){
    if(!state.ui) state.ui={activeTab:'Dashboard'};
    state.ui.ampel = state.ui.ampel || {visible:false, step:0, go:false, text:'—'};
    state.ui.ampel.text = String(t||'—');
    // no saveState here (too spammy)

    const els = [document.getElementById('ampelText'), document.getElementById('ampelTextO')];
    for(const el of els){
      if(el) el.textContent = t;
    }
  }


  async function runAmpelSequence(onGreen){
    if(ampelRunning) return false;
    ampelRunning = true;
    showAmpelOverlay(true);
    let startAccepted = true;
    try{
      const mrcPatterns = ['1000000','1100000','1110000','1111000','1111100'];
      // reset
      setLampState(0,false);
      setAmpelText('—');
      try{ await mrcCountdownSet('0000000'); }catch{}

      const steps = [5,4,3,2,1];
      const stepMs = Math.max(250, parseInt(state.settings.ampelStepMs,10) || 700);
      for(let i=0;i<steps.length;i++){
        const n = steps[i];
        setLampState(i+1,false);
        setAmpelText(String(n));
        try{ await mrcCountdownSet(mrcPatterns[i] || '0000000'); }catch{}
        await queueSpeak(String(n));
        await sleep(stepMs);
      }

      // wait phase (sync with display)
      setAmpelText('warten…');
      const waitMs = Math.max(0, parseInt(state.settings.ampelWaitMs,10) || 1200);
      await sleep(waitMs);

      // START / GREEN
      try{ await requestMrcSync('green'); }catch{}
      try{ await mrcCountdownSet('0000010'); }catch{}
      setLampState(5,true);
      setAmpelText('START');
      try{
        if(typeof onGreen==='function'){
          const onGreenResult = onGreen(getCurrentMrcClock());
          if(onGreenResult === false) startAccepted = false;
        }
      }catch(e){
        startAccepted = false;
        logLine('Ampel onGreen Fehler: '+String(e?.message||e));
      }
      await queueSpeak('Start');

      await sleep(250);
      // clear back to idle display (keep last state visible a bit)
      setAmpelText('—');
      setLampState(0,false);
      try{ await mrcCountdownSet('0000000'); }catch{}
      return startAccepted;
    } finally {
      showAmpelOverlay(false);
      ampelRunning = false;
      try{ renderSessionControl(); }catch{}
    }
  }

// --------------------- Session controls ---------------------
  const PASS_DEBOUNCE_MS = 700;

  
  async function sessionStart(){
    const freeDrivingToggle = !!state.ui.freeDrivingEnabled;
    saveState();

    if(state.session.state!=='IDLE') return false;

    if(!freeDrivingToggle && !state.modes.activeMode){
      toast('Session', 'Kein Rennmodus aktiv gesetzt.', 'warn');
      return false;
    }

    if(freeDrivingToggle){
      try{ await requestMrcSync('session-start'); }catch{}
      const started = sessionStartImmediate(getCurrentMrcClock());
      if(started===false){
        state.ui.freeDrivingEnabled = false;
        saveState();
        renderSessionControl();
        try{ sendPresenterSnapshot(true); }catch{}
      }
      return started;
    }

    // In Dauerschleife the start light is handled before the RACE phase, not at session start.
    if(state.modes.activeMode==='loop'){
      try{ await requestMrcSync('loop-session-start'); }catch{}
      const startMrc = getCurrentMrcClock();
      if(!Number.isFinite(Number(startMrc)) || Number(startMrc) <= 0){
        toast('Session', 'MRC-Zeit nicht bereit. Bitte Reader verbinden/synchronisieren.', 'err');
        logLine('Session Start blockiert: keine gültige MRC-Zeitbasis');
        return false;
      }
      return sessionStartImmediate(startMrc);
    }

    const useAmpel = !!state.settings.useAmpel;

    if(useAmpel){
      return await runAmpelSequence((greenMrcMs)=>sessionStartImmediate(greenMrcMs));
    }

    try{ await requestMrcSync('session-start'); }catch{}
    return sessionStartImmediate(getCurrentMrcClock());
  }

  function sessionStartImmediate(startMrcMs=null){

    const normalizedStartMrc = Number.isFinite(Number(startMrcMs)) ? Math.max(0, Number(startMrcMs)) : getCurrentMrcClock();
    if(!Number.isFinite(Number(normalizedStartMrc)) || Number(normalizedStartMrc) <= 0){
      toast('Session', 'MRC-Zeit nicht bereit. Bitte Reader verbinden/synchronisieren.', 'err');
      logLine('Session Start blockiert: keine gültige MRC-Zeitbasis');
      return false;
    }

    try{
      const endDurPage = document.getElementById('endDur');
      const endMinPage = document.getElementById('endMinStintLaps');
      const endMaxPage = document.getElementById('endMaxStintLaps');
      if(state.modes.activeMode==='endurance'){
        syncEnduranceSettingsFromPage();
        state.modes.endurance.durationMin = getNormalizedEnduranceDurationMin();
        if(endDurPage) endDurPage.value = String(state.modes.endurance.durationMin);
        if(endMinPage) endMinPage.value = String(state.modes.endurance.minStintLaps);
        if(endMaxPage) endMaxPage.value = String(state.modes.endurance.maxStintLaps);
        const endPenaltyPage = document.getElementById('endPenaltySeconds');
        const endPenaltyThresholdPage = document.getElementById('endPenaltyLapThresholdSeconds');
        const endPenaltyLapsPage = document.getElementById('endPenaltyLapsPerThreshold');
        if(endPenaltyPage) endPenaltyPage.value = String(state.modes.endurance.penaltySecondsPerViolation||0);
        if(endPenaltyThresholdPage) endPenaltyThresholdPage.value = String(state.modes.endurance.penaltyLapThresholdSeconds||0);
        if(endPenaltyLapsPage) endPenaltyLapsPage.value = String(state.modes.endurance.penaltyLapsPerThreshold||0);
        logLine(`Langstrecke Startparameter: ${state.modes.endurance.durationMin} Min, Mindeststint ${state.modes.endurance.minStintLaps}, Max-Stint ${state.modes.endurance.maxStintLaps||0}, Strafe ${state.modes.endurance.penaltySecondsPerViolation||0}s, Rundenabzug ab ${state.modes.endurance.penaltyLapThresholdSeconds||0}s: ${state.modes.endurance.penaltyLapsPerThreshold||0}`);
      }
    }catch{}

    state.session.isFreeDriving = !!state.ui.freeDrivingEnabled;
    state.session.state='RUNNING';
    state.session.startedAt = now();
    state.session.startedAtMrc = Number(normalizedStartMrc);
    state.session.pausedAt = null;
    state.session.pausedAtMrc = null;
    state.session.pauseAccumMs = 0;
    state.session.pauseAccumMrcMs = 0;
    state.session.lastPassByCarId = {};
    state.session.lastPassSeenByCarId = {};
    state.session.raceStartArmedByCarId = {};
    state.session.mrcCounterByChip = {};
    clearEnduranceActiveInfos();
    resetFinishRuntime();
    resetRaceAnnounceRuntime();
    state.ui.podiumRaceId = '';
    const startedRace = startNewRace();
    if(startedRace && state.session.startedAtMrc!=null){
      startedRace.startedAtMrc = state.session.startedAtMrc;
    }
    logLine(`MRC Startzeit gesetzt: ${Math.round(state.session.startedAtMrc)} ms seit Reader-Boot`);
    if(state.modes.activeMode==='endurance' && state.session.currentRaceId){
      clearEnduranceStintsForRace(state.session.currentRaceId);
    }

    if(state.modes.activeMode==='loop' && !state.session.isFreeDriving){
      loopInit();
      logLine('Loop Phase → TRAINING');
      if(state.audio?.enabled){ try{ queueSpeak('Training startet'); }catch{} }
      toast('Dauerschleife','Training gestartet','ok');
    } else {
      state.loopRuntime.phase=null; state.loopRuntime.phaseEndsAt=null; state.loopRuntime.remainingMs=null;
      if(state.session.isFreeDriving){
        if(state.audio?.enabled){ try{ queueSpeak('Freies Fahren startet'); }catch{} }
        toast('Session','Freies Fahren gestartet','ok');
      }
    }

    logLine(`Session START → ${getModeLabel()}`);
    saveState();
    renderSessionControl();
    try{ renderDashboard(); }catch{}
    try{ sendPresenterSnapshot(true); }catch{}
    return true;
  
  }


  function sessionStop(){
    if(state.session.state==='IDLE') return;

    state.session.state='IDLE';
    state.session.startedAt=null;
    state.session.startedAtMrc=null;
    state.session.pausedAt=null;
    state.session.pausedAtMrc=null;
    state.session.pauseAccumMs=0;
    state.session.pauseAccumMrcMs=0;
    state.session.lastPassByCarId = {};
    state.session.lastPassSeenByCarId = {};
    state.session.raceStartArmedByCarId = {};
    clearEnduranceActiveInfos();
    resetFinishRuntime();
    endCurrentRace();
    state.session.currentRaceId=null;
    state.session.isFreeDriving = false;
    state.ui.freeDrivingEnabled = false;

    state.loopRuntime.phase=null; state.loopRuntime.phaseEndsAt=null; state.loopRuntime.remainingMs=null;

    logLine('Session STOP');
    saveState();
    renderAll();
    try{ sendPresenterSnapshot(true); }catch{}
  }

  function sessionPause(){
    if(state.session.state!=='RUNNING') return;
    state.session.state='PAUSED';
    state.session.pausedAt = now();
    const mrcNow = getCurrentMrcClock();
    state.session.pausedAtMrc = Number.isFinite(Number(mrcNow)) ? Number(mrcNow) : null;
    if(state.modes.activeMode==='loop') loopOnPause();
    logLine('Session PAUSE');
    saveState();
    renderSessionControl();
  }

  function sessionResume(){
    if(state.session.state!=='PAUSED') return;
    const delta = now() - (state.session.pausedAt || now());
    state.session.pauseAccumMs += Math.max(0, delta);
    const mrcNow = getCurrentMrcClock();
    if(state.session.pausedAtMrc!=null && Number.isFinite(Number(mrcNow))){
      state.session.pauseAccumMrcMs += Math.max(0, Number(mrcNow) - Number(state.session.pausedAtMrc));
    }
    state.session.pausedAt = null;
    state.session.pausedAtMrc = null;
    state.session.state='RUNNING';
    if(state.modes.activeMode==='loop') loopOnResume();
    logLine('Session WEITER');
    saveState();
    renderSessionControl();
  }

  function sessionElapsedMs(){
    const mrcNow = getCurrentMrcClock();
    if(state.session.startedAtMrc==null || !Number.isFinite(Number(mrcNow))) return 0;
    const endMrc = (state.session.state==='PAUSED' && state.session.pausedAtMrc!=null) ? Number(state.session.pausedAtMrc) : Number(mrcNow);
    return Math.max(0, endMrc - Number(state.session.startedAtMrc) - Number(state.session.pauseAccumMrcMs||0));
  }

// --------------------- Finish window (end-of-race logic) ---------------------
function resetFinishRuntime(){
  state.session.finish = { pending:false, type:'', pendingSince:0, firstFinishTs:0, deadlineTs:0, finishedCarIds:{}, activeCarIds:[] };
}
function beginFinishWindow(type, opts={}){
  const f = state.session.finish || (state.session.finish={});
  if(f.pending) return;
  const track = getActiveTrack();
  const minLap = track?.minLapMs ?? 0;
  f.pending = true;
  f.type = type; // 'time'|'laps'
  f.pendingSince = getTimelineNowMs();
  f.firstFinishTs = opts.firstFinishTs || 0;
  f.deadlineTs = opts.deadlineTs || 0;
  f.finishedCarIds = {};
  // active cars are those that have at least one pass marker (lastPassByCarId entry)
  f.activeCarIds = Object.keys(state.session.lastPassByCarId || {});
  // if we already know the first finisher (laps mode), set deadline now
  if(f.firstFinishTs && !f.deadlineTs && minLap){
    f.deadlineTs = f.firstFinishTs + (minLap * 3);
  }
  // If there are no active cars, just end immediately.
  if(!f.activeCarIds.length){
    finishRaceNow('Keine aktiven Fahrer');
    return;
  }
  toast('Rennen', 'Zielphase: Alle Fahrer noch eine Runde beenden…', 'warn');
  logLine('Zielphase gestartet (Finish Window)');
  saveState();
}
function markCarFinished(carId, ts){
  const f = state.session.finish;
  if(!f?.pending) return;
  if(f.finishedCarIds[carId]) return;
  const finishedTs = ts || getTimelineNowMs();
  f.finishedCarIds[carId] = finishedTs;

  const track = getActiveTrack();
  const minLap = track?.minLapMs ?? 0;

  if(!f.firstFinishTs){
    f.firstFinishTs = finishedTs;
  }
  if(!f.deadlineTs && minLap){
    f.deadlineTs = f.firstFinishTs + (minLap * 3);
  }

  ensureRaceAnnounceRuntime();
  if(state.audio?.enabled && state.audio?.sayFinished){
    const raceId = state.session.currentRaceId || '';
    const key = raceId + ':' + String(carId);
    if(!state.session.announce.finishSaidByKey[key]){
      const name = getFinishNameForCarId(carId);
      if(name) queueSpeak(name + ' im Ziel');
      state.session.announce.finishSaidByKey[key] = true;
    }
  }

  const done = Object.keys(f.finishedCarIds).length;
  const total = f.activeCarIds.length;
  logLine(`Ziel: ${done}/${total} fertig`);
  try{ sendPresenterSnapshot(true); }catch{}
  saveState();
}



function teamTick(){
  if(state.session.state !== 'RUNNING') return;

  if(state.session.finish?.pending){
    finishTick();
    return;
  }

  if(state.modes.activeMode !== 'team') return;
  const fm = state.modes.team?.finishMode || 'none';
  if(fm === 'none') return;

  const rid = state.session.currentRaceId;
  if(!rid) return;

  if(fm === 'time'){
    const limitMs = Math.max(1, (state.modes.team.timeLimitSec||180)) * 1000;
    if(sessionElapsedMs() >= limitMs){
      beginFinishWindow('time');
    }
    return;
  }

  if(fm === 'laps'){
    const limit = Math.max(1, state.modes.team.lapLimit||20);
    const teams = state.modes.team?.teams || [];
    const laps = getRelevantRaceLaps(rid, state.session.laps||[]);
    let firstTeamId = null;
    for(const t of teams){
      const cnt = laps.filter(l=>{
        const did = String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim();
        return (t.driverIds||[]).includes(did);
      }).length;
      if(cnt >= limit){
        firstTeamId = t.id;
        break;
      }
    }
    if(firstTeamId){
      const ts = now();
      beginFinishWindow('laps', { firstFinishTs: ts });
    }
  }
}


function enduranceTick(){
  if(state.session.state !== 'RUNNING') return;

  if(state.session.finish?.pending){
    finishTick();
    return;
  }

  if(state.modes.activeMode !== 'endurance') return;
  const rid = state.session.currentRaceId;
  if(!rid) return;
  const race = getActiveRaceDay()?.races?.find(r=>r.id===rid) || null;
  const durationMin = Math.max(1, Number(race?.enduranceDurationMin || state.modes.endurance?.durationMin || 30));
  const limitMs = durationMin * 60_000;
  if(sessionElapsedMs() >= limitMs){
    beginFinishWindow('time');
  }
}

function finishTick(){
  const f = state.session.finish;
  if(!f?.pending) return;
  const total = f.activeCarIds.length;
  const done = Object.keys(f.finishedCarIds).length;

  // End when all finished OR deadline exceeded (overtime)
  if(done >= total){
    finishRaceNow('Alle Fahrer im Ziel');
    return;
  }
  if(f.deadlineTs && getTimelineNowMs() >= f.deadlineTs){
    // Let any already queued pass finish processing first, otherwise the
    // last lap that physically crossed during overtime can be dropped from
    // the final result if the timer tick wins the race against the pass queue.
    if(passQueueBusy || passQueue.length){
      return;
    }
    finishRaceNow('Überzeit erreicht');
    return;
  }
}
function finishRaceNow(reason){
  logLine(`Rennen beendet: ${reason}`);
  toast('Rennen beendet', reason, 'ok');
  ensureRaceAnnounceRuntime();

  // In Dauerschleife we do NOT stop the whole session. We show podium for 60s and continue.
  if(state.modes.activeMode === 'loop'){
    resetFinishRuntime();
    endCurrentRace(); // sets podiumRaceId
    if(state.audio?.enabled && state.audio?.sayRunFinished && !state.session.announce.runFinishedSaid){
      queueSpeak('Der Lauf ist beendet');
      state.session.announce.runFinishedSaid = true;
    }
    speakPlacementsForRace(state.ui.podiumRaceId || '');
    state.session.currentRaceId = null;

    state.loopRuntime.phase = 'podium';
    state.loopRuntime.phaseStartedAt = getTimelineNowMs();
    state.loopRuntime.phaseTotalSec = Math.ceil(Math.max(0,state.loopRuntime.remainingMs||0)/1000);
    try{ ensureRaceAnnounceRuntime(); state.session.announce.restSaidKeys = {}; }catch{}
    const lm = readLoopMinsFromUI();
    state.modes.loop.podiumMin = lm.podiumMin; saveState();
    state.loopRuntime.remainingMs = Math.max(0, Number(lm.podiumMin||0) * 60_000);
    state.loopRuntime.phaseEndsAt = getTimelineNowMs() + state.loopRuntime.remainingMs;

    logLine('Loop Phase → PODIUM (60s)');
    toast('Dauerschleife','Podium: 60 Sekunden','ok');
    saveState();
    renderAll();
    try{ sendPresenterSnapshot(true); }catch{}
    return;
  }

  // normal modes
  const finishedRaceId = state.session.currentRaceId || '';
  if(state.audio?.enabled && state.audio?.sayRunFinished && !state.session.announce.runFinishedSaid){
    queueSpeak('Der Lauf ist beendet');
    state.session.announce.runFinishedSaid = true;
  }
  speakPlacementsForRace(finishedRaceId);
  resetFinishRuntime();
  sessionStop();
}



  function currentPhase(){
    if(state.modes.activeMode==='loop' && state.loopRuntime.phase) return state.loopRuntime.phase;
    return getLapKind();
  }

  function handleIdlePass(car, ts, track){
    if(state.session.state!=='IDLE') return;
    if(state.settings?.allowIdleReads===false) return;

    state.session.idleLastPassByCarId = state.session.idleLastPassByCarId || {};
    state.session.idleLaps = state.session.idleLaps || [];

    const lastTs = state.session.idleLastPassByCarId[car.id];
    if(lastTs && (ts - lastTs) < PASS_DEBOUNCE_MS) return;
    state.session.idleLastPassByCarId[car.id] = ts;

    if(!lastTs){
      logLine(`Pass (ohne Session): ${car.name} → Startmarker`);
      renderDashboard();
      return;
    }

    const rawLapMs = ts - lastTs;
    const lapTiming = resolveLapMsForCar(car.id, rawLapMs);
    const lapMs = lapTiming.lapMs;
    if(!Number.isFinite(Number(lapMs)) || lapMs<=0){
      logLine(`Read ohne Session ignoriert: ${car.name} – keine gültige MRC-Rundenzeit`);
      return;
    }
    const minLap = track?.minLapMs ?? 0;
    if(minLap && lapMs < minLap){
      logLine(`Read ignoriert (ohne Session, zu schnell): ${car.name} ${msToTime(lapMs, 3)} < min ${msToTime(minLap, 3)}`);
      return;
    }

    const lapEntry = {
      id: uid('idlelap'),
      ts,
      trackId: (track?.id || ''),
      raceId: '',
      phase: 'IDLE',
      kind: 'Idle',
      modeLabel: 'Ohne Session',
      carId: car.id,
      driverId: car.driverId || '',
      lapMs,
      lapTimeSource: lapTiming.source,
      mrcLapMs: lapTiming.mrcMs,
      htmlLapMs: lapTiming.htmlMs
    };
    state.session.idleLaps.push(lapEntry);
    if(state.session.idleLaps.length > 500) state.session.idleLaps = state.session.idleLaps.slice(-500);
    saveState();

    const dn = getDriverNameForCar(car);
    logLine(`Read ohne Session: ${dn?dn+': ':''}${car.name} → ${msToTime(lapMs, 3)} • MRC`);
    renderDashboard();
    renderSessionControl();
    try{ sendPresenterSnapshot(true); }catch{}
  }

  function handlePass(chip, ts){
    const track = getActiveTrack();
    const car = ensureCarByChip(chip);
    if(!car) return;
    if(state.session.state!=='RUNNING'){
      if(state.session.state==='IDLE') handleIdlePass(car, ts, track);
      return;
    }

    // Langstrecke: nur ein aktiver Fahrer pro Team, automatischer Wechsel mit Mindeststint
    if(state.modes.activeMode==='endurance'){
      const did = String(car.driverId||'').trim();
      const rid = state.session.currentRaceId || '';
      const team = did ? getTeamForDriverInMode('endurance', did) : null;
      if(team && rid){
        const active = getEnduranceActiveInfo(team.id);
        if(!active){
          setEnduranceActiveInfo(team.id, { driverId: did, carId: car.id, activatedTs: ts, pendingStartMarker: false, stintLaps: 0 });
          saveState();
        }else if(active.driverId !== did || active.carId !== car.id){
          const minStint = Math.max(0, parseInt(state.modes.endurance?.minStintLaps||0,10) || 0);
          const stintLaps = Math.max(0, parseInt(active.stintLaps||0,10) || 0);
          if(stintLaps < minStint){
            logLine(`Langstrecke Wechsel ignoriert: ${team.name||'Team'} Mindeststint ${stintLaps}/${minStint}`);
            return;
          }
          const previousCarId = String(active.carId||'').trim();
          state.session.lastPassByCarId = state.session.lastPassByCarId || {};
          state.session.lastPassSeenByCarId = state.session.lastPassSeenByCarId || {};
          const transferredAnchorTs = previousCarId ? state.session.lastPassByCarId[previousCarId] : null;
          finalizeEnduranceStint(team.id, rid, ts);
          const nextInfo = { driverId: did, carId: car.id, activatedTs: ts, pendingStartMarker: !transferredAnchorTs, stintLaps: 0 };
          setEnduranceActiveInfo(team.id, nextInfo);
          if(transferredAnchorTs){
            state.session.lastPassByCarId[car.id] = transferredAnchorTs;
            delete state.session.lastPassSeenByCarId[car.id];
            logLine(`Langstrecke Wechsel: ${team.name||'Team'} → ${getDriver(did)?.name||car.name} (letzte Runde bleibt erhalten)`);
          }else{
            delete state.session.lastPassByCarId[car.id];
            delete state.session.lastPassSeenByCarId[car.id];
            logLine(`Langstrecke Wechsel: ${team.name||'Team'} → ${getDriver(did)?.name||car.name}`);
          }
          saveState();
        }
      }
    }

    state.session.lastPassSeenByCarId = state.session.lastPassSeenByCarId || {};
    const lastSeenTs = state.session.lastPassSeenByCarId[car.id];
    let anchorTs = state.session.lastPassByCarId[car.id];
    if(lastSeenTs && (ts - lastSeenTs) < PASS_DEBOUNCE_MS) return;
    state.session.lastPassSeenByCarId[car.id] = ts;

    const raceId = state.session.currentRaceId || '';
    const phase = currentPhase();
    const raceStartTs = getRaceStartTs(raceId);
    const shouldArmRaceOnFirstCrossing = !!(
      raceId &&
      phase==='race' &&
      !isFreeDrivingMode() &&
      state.session.state==='RUNNING' &&
      Number.isFinite(raceStartTs) && raceStartTs>0 &&
      ts >= raceStartTs
    );

    state.session.raceStartArmedByCarId = state.session.raceStartArmedByCarId || {};

    const minLap = track?.minLapMs ?? 0;
    if(!anchorTs){
      if(shouldArmRaceOnFirstCrossing){
        state.session.lastPassByCarId[car.id] = ts;
        state.session.raceStartArmedByCarId[car.id] = true;
        const dn = getDriverNameForCar(car);
        if(state.modes.activeMode==='endurance'){
          const did = String(car.driverId||'').trim();
          const team = did ? getTeamForDriverInMode('endurance', did) : null;
          const ai = team ? getEnduranceActiveInfo(team.id) : null;
          if(ai && ai.driverId===did && ai.carId===car.id && ai.pendingStartMarker){
            ai.pendingStartMarker = false;
            if(!Number.isFinite(Number(ai.stintLaps))) ai.stintLaps = 0;
            setEnduranceActiveInfo(team.id, ai);
            saveState();
          }
        }
        logLine(`Pass: ${dn?dn+': ':''}${car.name} → Startmarker gesetzt`);
        try{
          if(state.audio?.enabled){
            const nameToSay = getSpeakNameForCar(car);
            if(nameToSay) queueSpeak(nameToSay);
          }
        }catch{}
        return;
      }

      const sessionStartTs = Number.isFinite(raceStartTs) && raceStartTs>0 ? raceStartTs : Number(state.session.startedAtMrc || 0);
      const canCountFromSessionStart = sessionStartTs > 0 && (!minLap || (ts - sessionStartTs) >= minLap);
      if(canCountFromSessionStart){
        anchorTs = sessionStartTs;
      } else {
        state.session.lastPassByCarId[car.id] = ts;
        const dn = getDriverNameForCar(car);
        if(state.modes.activeMode==='endurance'){
          const did = String(car.driverId||'').trim();
          const team = did ? getTeamForDriverInMode('endurance', did) : null;
          const ai = team ? getEnduranceActiveInfo(team.id) : null;
          if(ai && ai.driverId===did && ai.carId===car.id && ai.pendingStartMarker){
            ai.pendingStartMarker = false;
            if(!Number.isFinite(Number(ai.stintLaps))) ai.stintLaps = 0;
            setEnduranceActiveInfo(team.id, ai);
            saveState();
          }
        }

        logLine(`Pass: ${car.name} (${chip}) → Startmarker`);
        try{
          if(state.audio?.enabled){
            const nameToSay = getSpeakNameForCar(car);
            if(nameToSay) queueSpeak(nameToSay);
          }
        }catch{}
        return;
      }
    }

    const rawLapMs = ts - anchorTs;
    const lapTiming = resolveLapMsForCar(car.id, rawLapMs);
    const lapMs = lapTiming.lapMs;
    if(!Number.isFinite(Number(lapMs)) || lapMs<=0){
      logLine(`Lap ignoriert: ${car.name} – keine gültige MRC-Rundenzeit`);
      return;
    }
    if(minLap && lapMs < minLap){
      logLine(`Lap ignoriert (zu schnell): ${car.name} ${msToTime(lapMs, 3)} < min ${msToTime(minLap, 3)} [MRC]`);
      return;
    }

    // First crossing after race start only arms the car; do not lose the lap anchor until a valid lap is counted.
    state.session.lastPassByCarId[car.id] = ts;

    if(state.session.ignoreNextLapByCarId && state.session.ignoreNextLapByCarId[car.id]){
      delete state.session.ignoreNextLapByCarId[car.id];
      logLine(`Lap ignoriert (Auto neu zugewiesen): ${car.name} ${msToTime(lapMs, 3)}`);
      saveState();
      return;
    }

    
// finish window: ignore any further laps after a car is finished
const f = state.session.finish;
if(f?.pending && f.finishedCarIds && f.finishedCarIds[car.id]){
  logLine(`Lap ignoriert (Ziel erreicht): ${car.name}`);
  return;
}
const lapPhase = currentPhase();
    const lapEntry = {
      id: uid('lap'),
      ts,
      trackId: (getActiveTrack()?.id || ''),
      raceId: state.session.currentRaceId,
      phase: lapPhase,
      kind: getLapKind(),
      modeLabel: getModeLabel(),
      carId: car.id,
      driverId: car.driverId || '',
      lapMs,
      lapTimeSource: lapTiming.source,
      mrcLapMs: lapTiming.mrcMs,
      htmlLapMs: lapTiming.htmlMs
    };
    state.session.laps.push(lapEntry);
    if(state.modes.activeMode==='endurance'){
      const did = String(car.driverId||'').trim();
      const team = did ? getTeamForDriverInMode('endurance', did) : null;
      const ai = team ? getEnduranceActiveInfo(team.id) : null;
      if(ai && ai.driverId===did && ai.carId===car.id){
        ai.stintLaps = Math.max(0, parseInt(ai.stintLaps||0,10) || 0) + 1;
        const maxStint = Math.max(0, parseInt(state.modes.endurance?.maxStintLaps||0,10) || 0);
        if(maxStint>0){
          if(ai.stintLaps === maxStint){
            logLine(`Langstrecke Wechsel fällig: ${team.name||'Team'} ${getDriver(did)?.name||car.name} hat ${ai.stintLaps}/${maxStint} Runden erreicht`);
            try{ if(state.audio?.enabled){ queueSpeak(`${getDriver(did)?.name||car.name} Wechsel`); } }catch{}
          }else if(ai.stintLaps > maxStint){
            logLine(`Langstrecke Max-Stint überschritten: ${team.name||'Team'} ${getDriver(did)?.name||car.name} ${ai.stintLaps}/${maxStint}`);
          }
        }
        setEnduranceActiveInfo(team.id, ai);
      }
    }
    saveState();

    // personal bests (Saison + Renntag)
    try{ updatePersonalBestsOnLap(track.id, ts, car, lapMs); }catch(e){}

    // track record (Saison + Renntag)
    if(!state.session.trackRecordSaid) state.session.trackRecordSaid = { season:{}, day:{} };

    if(track){
      const displayName = getDriverNameForCar(car) || 'Unbekannt';
      const speakName = getSpeakNameForCar(car) || displayName;

      // Saison-Rekord
      const recSeason = getTrackRecord(track, state.season.activeSeasonId);
      if(recSeason.ms==null || lapMs < recSeason.ms){
        recSeason.ms = lapMs;
        recSeason.driverId = car.driverId || null;
        recSeason.driverName = displayName;
        recSeason.speakName = speakName;
        recSeason.carName = car.name;
        saveState();

        if(state.audio?.enabled && state.audio?.sayTrackRecordSeason){
          const key = track.id + ':' + String(lapMs);
          if(!state.session.trackRecordSaid.season[key]){
            speakTrackRecord('Streckenrekord', speakName, lapMs);
            state.session.trackRecordSaid.season[key] = true;
          }
        }
      }

      // Renntag-Rekord
      const rd = getActiveRaceDay();
      if(rd && rd.trackId === track.id){
        const recDay = getRaceDayTrackRecord(rd, track.id);
        if(recDay.ms==null || lapMs < recDay.ms){
          recDay.ms = lapMs;
          recDay.driverId = car.driverId || null;
          recDay.driverName = displayName;
          recDay.speakName = speakName;
          recDay.carName = car.name;
          saveState();

          if(state.audio?.enabled && state.audio?.sayTrackRecordDay){
            const key = rd.id + ':' + track.id + ':' + String(lapMs);
            if(!state.session.trackRecordSaid.day[key]){
              speakTrackRecord('Renntag Streckenrekord', speakName, lapMs);
              state.session.trackRecordSaid.day[key] = true;
            }
          }
        }
      }
    }
const dn = getDriverNameForCar(car);
    logLine(`Lap: ${dn?dn+': ':''}${car.name} → ${msToTime(lapMs, 3)} (${lapPhase} • MRC)`);
    renderDashboard();
    renderSessionControl();
    try{ sendPresenterSnapshot(true); }catch{}
    
// finish window: once pending, the next valid lap for each active car counts as "finished"
if(state.session.finish?.pending){
  // Only count finishes for cars that were active when finish window started
  const f2 = state.session.finish;
  if(f2.activeCarIds && f2.activeCarIds.includes(car.id)){
    markCarFinished(car.id, ts);
  }
}
    maybeSpeakLap(car, lapMs, phase);
    maybeAnnounceOvertakeAndLapping(car);
  }

  // --------------------- Audio (TTS) ---------------------
  function getVoices(){ return ('speechSynthesis' in window) ? speechSynthesis.getVoices() : []; }
  function getSelectedVoice(){
    const uri = state.audio.voiceUri;
    const voices = getVoices();
    if(uri) return voices.find(v=>v.voiceURI===uri) || null;
    return voices.find(v=>/^de(-|$)/i.test(v.lang)) || voices[0] || null;
  }

  function speak(text){
    try{
      if(!state.audio.enabled) return;
      if(!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = getSelectedVoice();
      if(v) u.voice = v;
      u.rate = clamp(state.audio.rate, 0.5, 2.0);
      u.pitch = clamp(state.audio.pitch, 0, 2);
      u.volume = clamp(state.audio.volume, 0, 1);
      speechSynthesis.speak(u);
    }catch(e){
      logLine('Audio Fehler: ' + String(e?.message||e));
    }
  }

  function countLapsForCarInRace(carId, raceId, phase){
    let n=0;
    for(const l of state.session.laps){
      if(l.carId===carId && l.raceId===raceId){
        if(!phase || l.phase===phase) n++;
      }
    }
    return n;
  }

  let _rootFallbackAudio = null;

  async function playSimpleLapBeep(){
    try{
      const ctx = getAudioContext();
      if(!ctx) return false;
      if(ctx.state === 'suspended') await ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + 0.01;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.13);
      return true;
    }catch{
      return false;
    }
  }

  async function ensureBuiltInDefaultDriverSound(){
    try{
      let rec = null;
      try{ rec = await audioAssetGet(BUILTIN_DEFAULT_SOUND_ID); }catch{}
      let meta = getAudioAssetMeta(BUILTIN_DEFAULT_SOUND_ID);
      if(!rec || !rec.dataUrl || !meta){
        const buf = await dataUrlToAudioBuffer(BUILTIN_DEFAULT_SOUND_DATA_URL);
        const analyzed = analyzeAudioBuffer(buf);
        await audioAssetPut({
          id: BUILTIN_DEFAULT_SOUND_ID,
          name: 'defaultsound.mp3',
          type: 'audio/mpeg',
          size: 0,
          updatedAt: now(),
          dataUrl: BUILTIN_DEFAULT_SOUND_DATA_URL
        });
        meta = {
          id: BUILTIN_DEFAULT_SOUND_ID,
          name: BUILTIN_DEFAULT_SOUND_NAME,
          category: 'System',
          mime: 'audio/mpeg',
          sizeBytes: 0,
          durationSec: analyzed.durationSec,
          sampleRate: analyzed.sampleRate,
          channels: analyzed.channels,
          peak: analyzed.peak,
          peakDb: analyzed.peakDb,
          rms: analyzed.rms,
          rmsDb: analyzed.rmsDb,
          waveform: analyzed.waveform,
          targetDb: Number(state.audio?.targetDb || -16),
          gainDb: calcRecommendedGainDb(analyzed, Number(state.audio?.targetDb || -16)),
          trimStartMs: 0,
          trimEndMs: 0,
          fadeInMs: 0,
          fadeOutMs: 0,
          builtIn: true,
          updatedAt: now()
        };
        const list = getAudioLibrary();
        const idx = list.findIndex(x=>x.id===BUILTIN_DEFAULT_SOUND_ID);
        if(idx>=0) list[idx] = meta; else list.unshift(meta);
      }
      if(!String(state.audio?.defaultDriverSoundId || '').trim()) state.audio.defaultDriverSoundId = BUILTIN_DEFAULT_SOUND_ID;
      if(!String(state.ui?.audioSelectedId || '').trim()) state.ui.audioSelectedId = BUILTIN_DEFAULT_SOUND_ID;
      saveState();
      return meta;
    }catch(err){
      logLine('builtin default sound error: ' + String(err?.message || err));
      return null;
    }
  }

  async function playDefaultDriverSound(){
    const id = String(state.audio?.defaultDriverSoundId || '').trim() || BUILTIN_DEFAULT_SOUND_ID;
    let meta = getAudioAssetMeta(id);
    if(!meta && id===BUILTIN_DEFAULT_SOUND_ID) meta = await ensureBuiltInDefaultDriverSound();
    if(!meta) return false;
    try{
      await previewAudioAsset(meta);
      return true;
    }catch(err){
      logLine('default sound error: ' + String(err?.message || err));
      return false;
    }
  }

  async function resolveRootFallbackSoundUrl(forceRefresh=false){
    return '';
  }

  async function playRootFallbackSound(){
    return await playDefaultDriverSound();
  }

  async function playDriverLapSound(car){
    const driverId = String(car?.driverId || '').trim();
    if(driverId){
      const soundId = getDriverLapSoundId(driverId);
      if(soundId){
        const meta = getAudioAssetMeta(soundId);
        if(meta){
          try{
            await previewAudioAsset(meta);
            return true;
          }catch(err){
            logLine('driver sound error: ' + String(err?.message || err));
          }
        }
      }
    }
    return await playRootFallbackSound();
  }

  function maybeSpeakLap(car, lapMs, phase){
    if(!state.audio?.enabled) return;
    const mode = state.audio.lapAnnounceMode;

    if(mode==='Nur Bestzeit'){
      playDriverLapSound(car);
      return;
    }

    if(mode==='Aus'){
      playRootFallbackSound();
      return;
    }

    const driverName = getSpeakNameForCar(car) || getDriverNameForCar(car);
    const lapNo = countLapsForCarInRace(car.id, state.session.currentRaceId, phase);

    const parts=[];
    if(state.audio.sayName) parts.push(driverName || car.name);
    if(state.audio.sayLapNo) parts.push('Runde ' + lapNo);
    if(state.audio.sayLapTime) parts.push(msToSpeechTime(lapMs, state.audio.decimals));
    if(!parts.length){
      const fallback = msToSpeechTime(lapMs, state.audio.decimals);
      if(fallback) queueSpeak(fallback); else playRootFallbackSound();
      return;
    }
    queueSpeak(parts.join(', '));
  }

  
  // --------------------- Speech queue (no overlap) ---------------------
  let speechQueue = Promise.resolve();

  function speakPromise(text){
    return new Promise((resolve)=>{
      try{
        if(!state.audio.enabled) return resolve();
        if(!('speechSynthesis' in window)) return resolve();

        // Safety: speech events sometimes never fire (permissions/voices loading).
        // Never block the start sequence because of TTS.
        let done = false;
        const finish = ()=>{
          if(done) return;
          done = true;
          try{ clearTimeout(t); }catch{}
          resolve();
        };
        const t = setTimeout(finish, 4500);

        const u = new SpeechSynthesisUtterance(text);
        const v = getSelectedVoice();
        if(v) u.voice = v;
        u.rate = clamp(state.audio.rate, 0.5, 2.0);
        u.pitch = clamp(state.audio.pitch, 0, 2);
        u.volume = clamp(state.audio.volume, 0, 1);
        u.onend = finish;
        u.onerror = finish;
        try{ speechSynthesis.cancel(); }catch{}
        speechSynthesis.speak(u);
      }catch{
        resolve();
      }
    });
  }

  function queueSpeak(text){
    speechQueue = Promise.resolve(speechQueue)
      .catch(()=>{})
      .then(()=>speakPromise(text));
    return speechQueue;
  }

  



  function ensurePersonalStores(){
    if(!state.personalRecords) state.personalRecords = {bySeason:{}, byRaceDay:{}};
    if(!state.personalRecords.bySeason) state.personalRecords.bySeason = {};
    if(!state.personalRecords.byRaceDay) state.personalRecords.byRaceDay = {};
  }

  function getPBSeason(seasonId, trackId, driverId){
    ensurePersonalStores();
    return state.personalRecords.bySeason?.[seasonId]?.[trackId]?.[driverId] || null;
  }
  function getPBDay(raceDayId, trackId, driverId){
    ensurePersonalStores();
    return state.personalRecords.byRaceDay?.[raceDayId]?.[trackId]?.[driverId] || null;
  }

  function setPBSeason(seasonId, trackId, driverId, rec){
    ensurePersonalStores();
    if(!state.personalRecords.bySeason[seasonId]) state.personalRecords.bySeason[seasonId] = {};
    if(!state.personalRecords.bySeason[seasonId][trackId]) state.personalRecords.bySeason[seasonId][trackId] = {};
    state.personalRecords.bySeason[seasonId][trackId][driverId] = rec;
  }
  function setPBDay(raceDayId, trackId, driverId, rec){
    ensurePersonalStores();
    if(!state.personalRecords.byRaceDay[raceDayId]) state.personalRecords.byRaceDay[raceDayId] = {};
    if(!state.personalRecords.byRaceDay[raceDayId][trackId]) state.personalRecords.byRaceDay[raceDayId][trackId] = {};
    state.personalRecords.byRaceDay[raceDayId][trackId][driverId] = rec;
  }

  function speakPersonalBest(prefix, car, lapMs){
    if(!state.audio?.enabled) return;
    const mode = state.audio?.lapAnnounceMode || 'Jede Runde';
    if(mode==='Nur Bestzeit'){
      const name = getSpeakNameForCar(car) || getDriverNameForCar(car) || car?.name || 'Unbekannt';
      const parts = [];
      if(name) parts.push(name);
      parts.push(prefix);
      if(Number.isFinite(lapMs)) parts.push(msToSpeechTime(lapMs, state.audio?.decimals ?? 3));
      queueSpeak(parts.join(', '));
      return;
    }
    queueSpeak(prefix);
  }

  function updatePersonalBestsOnLap(trackId, lapTs, car, lapMs){
    if(!trackId || !car || !car.driverId || lapMs==null) return;
    const driverId = String(car.driverId);
    const driverName = (car?.driverId ? getDriverSpeakName(car.driverId) : '') || (car?.driverId ? getDriverSpeakName(car.driverId) : '') || getDriverNameForCar(car) || 'Unbekannt';

    // Season PB
    const seasonId = state.season?.activeSeasonId || '';
    if(seasonId){
      const cur = getPBSeason(seasonId, trackId, driverId);
      if(!cur || cur.bestMs==null || lapMs < cur.bestMs){
        setPBSeason(seasonId, trackId, driverId, {bestMs:lapMs, ts:lapTs, carName:car.name||'', driverName});
        saveState();
        if(state.audio?.enabled && state.audio?.sayPersonalBestSeason){
          speakPersonalBest('Persönliche Bestzeit', car, lapMs);
        }
      }
    }

    // RaceDay PB (only if active renntag matches track)
    const rd = getActiveRaceDay();
    if(rd && rd.trackId===trackId){
      const cur = getPBDay(rd.id, trackId, driverId);
      if(!cur || cur.bestMs==null || lapMs < cur.bestMs){
        setPBDay(rd.id, trackId, driverId, {bestMs:lapMs, ts:lapTs, carName:car.name||'', driverName});
        saveState();
        if(state.audio?.enabled && state.audio?.sayPersonalBestDay){
          speakPersonalBest('Persönliche Tagesbestzeit', car, lapMs);
        }
      }
    }
  }

function speakTrackRecord(prefix, name, ms){
    if(!state.audio?.enabled) return;
    // Only say the record type; name/time is already announced via the normal lap callout.
    queueSpeak(prefix);
  }



  function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }


// --------------------- BLE (WebBluetooth / MRC NUS) ---------------------
const BLE_NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const BLE_NUS_RX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
const BLE_NUS_TX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
const BLE_MRC_WRITE_SERVICE_UUID = 'c8659210-af91-4ad3-a995-a58d6fd26145';
let bleDevice = null;
let bleServer = null;
let bleTxChar = null;
let bleRxChar = null;
let bleNotifyHandler = null;
let bleLineBuffer = '';
let bleReconnectTimer = null;
let bleReconnectAttempt = 0;
let bleReconnectSuppressedUntil = 0;

function pushBleLogLine(line){
  state.ble.lastLines.unshift(line);
  if(state.ble.lastLines.length>800) state.ble.lastLines = state.ble.lastLines.slice(0,800);
}

function updateMrcCounterFromLine(line){
  const m = /^\s*\d+\s*,\s*([0-9A-Fa-f]+)\s*,\s*(\d+)\s*$/.exec(String(line||''));
  if(!m) return null;
  const chip = String(m[1]||'').toUpperCase();
  const current = parseInt(m[2], 10);
  if(!chip || !Number.isFinite(current)) return null;
  state.session.mrcCounterByChip = state.session.mrcCounterByChip || {};
  const prev = state.session.mrcCounterByChip[chip] || null;
  const delta = (prev && Number.isFinite(prev.current)) ? Math.max(0, current - prev.current) : null;
  state.session.mrcCounterByChip[chip] = {
    current,
    previous: prev && Number.isFinite(prev.current) ? prev.current : null,
    delta,
    updatedAt: now()
  };
  return state.session.mrcCounterByChip[chip];
}

function getMrcDeltaForCar(carId){
  const car = carId ? getCar(carId) : null;
  const chip = String(car?.chipCode || '').trim().toUpperCase();
  const rec = chip ? state.session.mrcCounterByChip?.[chip] : null;
  return rec && Number.isFinite(rec.delta) ? rec.delta : null;
}

function formatMrcDeltaMs(ms){
  return (ms==null || !Number.isFinite(ms)) ? '—' : msToTime(ms, 3);
}

function getLapTimeSource(){
  return 'mrc';
}

function resolveLapMsForCar(carId, rawMrcLapMs=null){
  const car = carId ? getCar(carId) : null;
  const mrcMs = car ? getMrcDeltaForCar(car.id) : null;
  const fallbackMrcMs = Number.isFinite(Number(rawMrcLapMs)) && Number(rawMrcLapMs) > 0 ? Number(rawMrcLapMs) : null;
  const effectiveMrcMs = (Number.isFinite(mrcMs) && mrcMs > 0) ? mrcMs : fallbackMrcMs;
  return {
    lapMs: effectiveMrcMs,
    source: 'mrc',
    mrcMs: effectiveMrcMs,
    htmlMs: null
  };
}

function setBleUi(connected){
  try{
    const dot = document.getElementById('btDot');
    const label = document.getElementById('btLabel');
    const badge = document.getElementById('badgeBt');
    const hasKnown = !!(state.ble?.knownDeviceId || state.ble?.knownDeviceName);
    const deviceName = String(state.ble?.knownDeviceName || state.ble?.info || '').trim();
    const info = deviceName ? (' ('+deviceName+')') : '';
    if(dot){
      dot.classList.toggle('green', !!connected);
      dot.classList.toggle('amber', !connected && !!state.ble.available);
    }
    if(label){
      if(connected) label.textContent = 'BT verbunden' + info;
      else if(state.ble.available && hasKnown) label.textContent = 'BT Reconnect nötig' + info;
      else if(state.ble.available) label.textContent = 'BT bereit';
      else label.textContent = 'BT verbinden';
    }
    if(badge){
      if(connected) badge.textContent = 'BT: ' + (state.ble.notify ? 'an' : 'verb.');
      else if(state.ble.available && hasKnown) badge.textContent = 'BT: reconnect';
      else badge.textContent = 'BT: ' + (state.ble.available ? 'bereit' : 'aus');
    }
  }catch{}
}

function bleSupportsSilentReconnect(){
  return !!(('bluetooth' in navigator) && typeof navigator.bluetooth?.getDevices === 'function');
}

function bleHasKnownDevice(){
  return !!(state.ble?.knownDeviceId || state.ble?.knownDeviceName);
}

function bleReconnectDelayMs(n){
  return [1000, 2000, 5000, 10000, 15000, 20000][Math.min(n,5)] || 20000;
}

function clearBleReconnectTimer(){
  if(bleReconnectTimer){
    clearTimeout(bleReconnectTimer);
    bleReconnectTimer = null;
  }
}

function scheduleBleReconnect(reason){
  if(state.ble.connected || bleDevice?.gatt?.connected) return;
  if(!state.ble?.autoReconnect || !bleHasKnownDevice()) return;
  if(!bleSupportsSilentReconnect()) return;
  if(Date.now() < bleReconnectSuppressedUntil) return;
  if(bleReconnectAttempt >= 6) return;
  if(bleReconnectTimer) return;
  const delay = bleReconnectDelayMs(bleReconnectAttempt);
  bleReconnectAttempt++;
  bleReconnectTimer = setTimeout(async ()=>{
    bleReconnectTimer = null;
    const ok = await bleConnect({ preferKnown:true, silent:true, autoReconnect:true, allowPrompt:false });
    if(ok){
      logLine('BT Auto-Reconnect erfolgreich');
      toast('Bluetooth','Letztes Gerät wieder verbunden.','ok');
    } else {
      logLine('BT Auto-Reconnect fehlgeschlagen');
      scheduleBleReconnect('retry');
    }
  }, delay);
  logLine('BT Auto-Reconnect geplant in ' + Math.round(delay/1000) + 's' + (reason ? (' (' + reason + ')') : ''));
}

async function mrcWriteLine(line){
  const payload = String(line||'').trim();
  if(!payload) return false;
  const wire = payload.endsWith('\n') ? payload : (payload + '\n');
  const bytes = new TextEncoder().encode(wire);
  let sent = false;
  if(bleRxChar){
    await bleRxChar.writeValue(bytes);
    sent = true;
  }
  if(port?.writable){
    const writer = port.writable.getWriter();
    try{ await writer.write(bytes); sent = true; } finally { try{ writer.releaseLock(); }catch{} }
  }
  if(sent) logLine('MRC CMD: ' + payload);
  return sent;
}

async function requestMrcSync(reason=''){
  try{
    const ok = await mrcWriteLine('CMD_SYNC');
    if(ok && reason) logLine('MRC SYNC angefordert' + (reason ? ' [' + reason + ']' : ''));
    return ok;
  }catch(e){
    logLine('MRC SYNC Fehler: ' + String(e?.message||e));
    return false;
  }
}

async function mrcCountdownSet(pattern){
  const p = String(pattern||'').replace(/[^01]/g,'').slice(0,7).padEnd(7,'0');
  return mrcWriteLine('CMD_COUNTDOWN_SET:' + p);
}

function handleMrcMetaLine(line){
  const s = String(line||'').trim();
  if(!s) return false;
  if(/^MSG_PONG/i.test(s)) return true;
  const mSync = /^MSG_SYNC\s*:\s*(\d+)\s*$/i.exec(s);
  if(mSync){
    const deviceMs = parseInt(mSync[1],10);
    updateMrcClock(deviceMs, 'sync');
    logLine('MRC SYNC: ' + deviceMs + ' ms');
    return true;
  }
  if(/^MSG_INIT_/i.test(s)) return true;
  return false;
}

function onBleAsciiLine(line){
  logLine('BT: ' + line);
  pushBleLogLine(line);
  if(handleMrcMetaLine(line)) return;
  const m = /^\s*\d+\s*,\s*([0-9A-Fa-f]+)\s*,\s*(\d+)\s*$/.exec(line);
  if(!m) return;
  updateMrcCounterFromLine(line);
  const chip = m[1].toUpperCase();
  const ts = parseInt(m[2], 10);
  updateMrcClock(ts, 'pass');
  enqueuePass(chip, ts, line);
}

function handleBleTextFragment(text){
  bleLineBuffer += text;
  bleLineBuffer = bleLineBuffer.replace(/\r/g, '');
  let idx;
  while((idx = bleLineBuffer.indexOf('\n')) >= 0){
    const line = bleLineBuffer.slice(0, idx).trim();
    bleLineBuffer = bleLineBuffer.slice(idx + 1);
    if(line) onBleAsciiLine(line);
  }
}

function bleRememberDevice(device){
  try{
    if(!state.ble) state.ble = {};
    state.ble.knownDeviceId = String(device?.id || '');
    state.ble.knownDeviceName = String(device?.name || '');
    if(!state.ble.info && state.ble.knownDeviceName) state.ble.info = state.ble.knownDeviceName;
    saveState();
  }catch(e){
    try{ logLine('BT Speicherwarnung: ' + String(e?.message||e)); }catch{}
  }
}

async function bleStartNotify(){
  if(!bleServer) throw new Error('Kein BLE-Server verbunden');
  const service = await bleServer.getPrimaryService(BLE_NUS_SERVICE_UUID);
  bleTxChar = await service.getCharacteristic(BLE_NUS_TX_UUID);
  bleRxChar = await service.getCharacteristic(BLE_NUS_RX_UUID);
  await bleTxChar.startNotifications();
  bleNotifyHandler = ev => {
    try{
      const bytes = new Uint8Array(ev.target.value.buffer.slice(0));
      const dec = new TextDecoder('utf-8');
      handleBleTextFragment(dec.decode(bytes));
    }catch(e){
      logLine('BT Read Fehler: ' + String(e?.message||e));
    }
  };
  bleTxChar.addEventListener('characteristicvaluechanged', bleNotifyHandler);
  state.ble.notify = true;
  saveState();
  setBleUi(true);
  logLine('BT Notify aktiv (MRC NUS)');
}

async function bleConnect(opts){
  const options = opts || {};
  const silent = !!options.silent;
  const allowPrompt = options.allowPrompt !== false;
  if(!('bluetooth' in navigator)){
    if(!silent) toast('Bluetooth', 'Web Bluetooth nur in Chrome/Edge und sicherem Kontext verfügbar.', 'err');
    logLine('BT Fehler: Web Bluetooth nicht verfügbar');
    return false;
  }
  try{
    state.ble.available = true;
    let device = options.device || null;
    if(!device && options.preferKnown && typeof navigator.bluetooth.getDevices === 'function'){
      const devices = await navigator.bluetooth.getDevices();
      const knownId = String(state.ble.knownDeviceId || '');
      const knownName = String(state.ble.knownDeviceName || '');
      device = devices.find(d => knownId && String(d.id||'')===knownId)
        || devices.find(d => knownName && String(d.name||'')===knownName)
        || devices.find(d => String(d.name||'').startsWith('MRC'))
        || null;
    }
    if(!device){
      if(!allowPrompt){
        state.ble.lastError = 'Kein autorisiertes Bluetooth-Gerät verfügbar.';
        saveState();
        setBleUi(false);
        return false;
      }
      device = await navigator.bluetooth.requestDevice({
        filters:[{ namePrefix:'MRC' }],
        optionalServices:[0x1800, 0x1801, BLE_NUS_SERVICE_UUID, BLE_MRC_WRITE_SERVICE_UUID]
      });
    }
    bleDevice = device;
    bleRememberDevice(device);
    try{ bleDevice.removeEventListener('gattserverdisconnected', onBleDisconnected); }catch{}
    bleDevice.addEventListener('gattserverdisconnected', onBleDisconnected);
    bleServer = await bleDevice.gatt.connect();
    state.ble.connected = true;
    state.ble.info = bleDevice.name || state.ble.knownDeviceName || 'BLE';
    state.ble.lastError = '';
    clearBleReconnectTimer();
    bleReconnectAttempt = 0;
    bleReconnectSuppressedUntil = 0;
    saveState();
    setBleUi(true);
    logLine('BT verbunden ' + (state.ble.info?('('+state.ble.info+')'):''));
    if(!silent) toast('Bluetooth','Verbunden.','ok');
    await bleStartNotify();
    try{ await mrcWriteLine('CMD_INIT'); }catch{}
    try{ await requestMrcSync('bt-connect'); }catch{}
    return true;
  }catch(e){
    bleServer = null;
    state.ble.connected = false;
    state.ble.notify = false;
    state.ble.lastError = String(e?.message||e);
    saveState();
    setBleUi(false);
    logLine('BT Fehler: ' + state.ble.lastError);
    if(!silent) toast('Bluetooth','Verbindung fehlgeschlagen/abgebrochen: ' + state.ble.lastError,'err');
    return false;
  }
}

async function bleAutoReconnectOnLoad(){
  try{
    if(!('bluetooth' in navigator)) return false;
    if(!state.ble?.autoReconnect) return false;
    if(!bleHasKnownDevice()) return false;
    if(!bleSupportsSilentReconnect()){
      state.ble.connected = false;
      state.ble.notify = false;
      saveState();
      setBleUi(false);
      const knownName = String(state.ble?.knownDeviceName || 'letztes Gerät');
      logLine('BT Auto-Reconnect nicht verfügbar: Browser erlaubt kein stilles Wiederverbinden (kein getDevices).');
      try{ toast('Bluetooth', 'Automatisches Wiederverbinden wird von diesem Browser nicht unterstützt. Bitte „Bluetooth verbinden“ für ' + knownName + ' antippen.', 'warn'); }catch{}
      return false;
    }
    logLine('BT Auto-Reconnect: versuche letztes Gerät wieder zu verbinden');
    const ok = await bleConnect({ preferKnown:true, silent:true, autoReconnect:true, allowPrompt:false });
    if(ok){
      logLine('BT Auto-Reconnect erfolgreich');
      toast('Bluetooth','Letztes Gerät wieder verbunden.','ok');
    } else {
      logLine('BT Auto-Reconnect nicht möglich');
    }
    return ok;
  }catch(e){
    logLine('BT Auto-Reconnect Fehler: ' + String(e?.message||e));
    return false;
  }
}

async function bleDisconnect(silent, opts){
  const options = opts || {};
  const manual = options.manual !== false;
  const allowReconnect = options.scheduleReconnect !== false;
  if(manual){
    bleReconnectSuppressedUntil = Date.now() + 4000;
    clearBleReconnectTimer();
    bleReconnectAttempt = 0;
  }
  try{
    if(bleTxChar && bleNotifyHandler){
      try{ bleTxChar.removeEventListener('characteristicvaluechanged', bleNotifyHandler); }catch{}
      try{ await bleTxChar.stopNotifications(); }catch{}
    }
    bleNotifyHandler = null;
    bleTxChar = null;
    bleRxChar = null;
    bleLineBuffer = '';
    try{ if(bleDevice?.gatt?.connected) bleDevice.gatt.disconnect(); }catch{}
  } finally {
    bleDevice = null;
    bleServer = null;
    state.ble.connected = false;
    state.ble.notify = false;
    state.ble.info = '';
    saveState();
    setBleUi(false);
    if(!silent){
      logLine('BT getrennt');
      toast('Bluetooth','Getrennt.','warn');
    }
    if(!manual && allowReconnect) scheduleBleReconnect('disconnect');
  }
}

function onBleDisconnected(){
  if(state.ble.connected || state.ble.notify){
    logLine('BT Gerät getrennt');
    toast('Bluetooth','Gerät getrennt.','warn');
  }
  bleDisconnect(true, { manual:false, scheduleReconnect:true });
}

// --------------------- USB (WebSerial) ---------------------
  let port=null, reader=null, stopRead=false;


let usbReconnectTimer=null;
let usbReconnectAttempt=0;

function usbReconnectDelayMs(n){
  // simple backoff: 1s, 2s, 5s, 10s, 15s ...
  return [1000, 2000, 5000, 10000, 15000, 20000][Math.min(n,5)] || 20000;
}

function scheduleUsbReconnect(reason){
  if(!('serial' in navigator)) return;
  if(state.usb.connected) return;
  if(usbReconnectAttempt>=6) return;
  if(usbReconnectTimer) return;
  const delay = usbReconnectDelayMs(usbReconnectAttempt);
  usbReconnectAttempt++;
  usbReconnectTimer = setTimeout(async ()=>{
    usbReconnectTimer=null;
    await usbAutoConnect(reason || 'retry');
  }, delay);
  logLine('USB Auto-Reconnect geplant in ' + Math.round(delay/1000) + 's' + (reason?(' ('+reason+')'):''));
}

async function usbAutoConnect(reason){
  if(state.usb.connected || port) return;
  if(!('serial' in navigator)) return;
  try{
    const ports = await navigator.serial.getPorts();
    if(!ports || !ports.length) return;
    const p = ports[0];
    stopRead=false;
    port = p;
    await port.open({ baudRate: state.settings.baudRate||19200, dataBits:8, stopBits:1, parity:'none', flowControl:'none' });
    state.usb.available=true;
    state.usb.connected=true;
    state.usb.info=getPortInfo(port);
    state.usb.lastError='';
    saveState();
    setUsbUi(true);
    usbReconnectAttempt=0;
    logLine('USB auto-verbunden ' + (state.usb.info?('('+state.usb.info+')'):'') + (reason?(' ['+reason+']'):''));
    toast('USB','Auto-verbunden.','ok');
    readLoop();
    setTimeout(()=>{ try{ mrcWriteLine('CMD_INIT'); }catch{} try{ requestMrcSync('usb-autoconnect'); }catch{} }, 120);
  }catch(e){
    // Failed (busy, permission, etc.)
    try{ if(port){ try{ await port.close(); }catch{} } }catch{}
    port=null;
    state.usb.connected=false;
    state.usb.lastError = String(e?.message||e);
    saveState();
    setUsbUi(false);
    logLine('USB Auto-Reconnect fehlgeschlagen: ' + state.usb.lastError);
    scheduleUsbReconnect('fail');
  }
}


  function setUsbUi(connected){
    const dot = document.getElementById('usbDot');
    const label = document.getElementById('usbLabel');

    dot.classList.toggle('green', !!connected);
    dot.classList.toggle('amber', !connected && !!state.usb.available);

    const info = state.usb.info ? (' ('+state.usb.info+')') : '';
    if(connected){
      label.textContent = 'USB verbunden' + info;
    } else if(state.usb.available){
      label.textContent = 'USB erkannt' + info;
    } else {
      label.textContent = 'USB verbinden';
    }
    document.getElementById('badgeUsb').textContent = 'USB: ' + (connected?'an':(state.usb.available?'bereit':'aus'));
  }

  function getPortInfo(p){
    try{
      const i = p.getInfo();
      const parts=[];
      if(i.usbVendorId) parts.push('VID ' + i.usbVendorId.toString(16));
      if(i.usbProductId) parts.push('PID ' + i.usbProductId.toString(16));
      return parts.join(' ');
    }catch{ return ''; }
  }

  

  async function usbProbeOnLoad(){
    if(!('serial' in navigator)) return;
    try{
      // If state says connected but we don't have an open port, reset
      if(state.usb.connected && !port){
        state.usb.connected=false;
      }
      const ports = await navigator.serial.getPorts();
      if(ports && ports.length){
        state.usb.available=true;
        // Pick first previously authorized port
        const p = ports[0];
        state.usb.info = getPortInfo(p);
        state.usb.lastError = '';
        // Try a quick open/close to verify it is accessible (does not keep it open)
        try{
          await p.open({ baudRate: state.settings.baudRate||19200, dataBits:8, stopBits:1, parity:'none', flowControl:'none' });
          await p.close();
        }catch(e){
          state.usb.lastError = String(e?.message||e);
          // Still "available", but might be busy/blocked
        }

        // Auto-reconnect if we have an authorized port
        if(!state.usb.connected) await usbAutoConnect('onload');
      } else {
        state.usb.available=false;
        state.usb.info='';
        state.usb.lastError='';
      }
      saveState();
      setUsbUi(!!state.usb.connected);
      if(state.usb.available && state.usb.lastError){
        logLine('USB Hinweis: Gerät erkannt, aber nicht geöffnet (' + state.usb.lastError + ')');
      } else if(state.usb.available){
        logLine('USB erkannt ' + (state.usb.info?('('+state.usb.info+')'):''));
      }
    }catch(e){
      // ignore
    }
  }

  function installUsbConnectDisconnectListeners(){
    if(!('serial' in navigator)) return;
    try{
      navigator.serial.addEventListener('connect', async (ev)=>{
        try{
          const p = ev?.target || ev?.port || null;
          state.usb.available=true;
          state.usb.info = p ? getPortInfo(p) : state.usb.info;
          state.usb.lastError='';
          saveState();
          setUsbUi(!!state.usb.connected);
          logLine('USB Gerät verbunden ' + (state.usb.info?('('+state.usb.info+')'):''));
          toast('USB','Gerät verbunden.','ok');
          if(!state.usb.connected) scheduleUsbReconnect('device-connect');
        }catch{}
      });
      navigator.serial.addEventListener('disconnect', async ()=>{
        try{
          state.usb.available=false;
          state.usb.info='';
          state.usb.lastError='';
          // If the currently open port vanished, ensure we disconnect
          if(state.usb.connected) await usbDisconnect();
          saveState();
          setUsbUi(false);
          logLine('USB Gerät getrennt');
          toast('USB','Gerät getrennt.','warn');
        }catch{}
      });
    }catch{}
  }
async function usbConnect(){
    if(!('serial' in navigator)){
      toast('USB', 'WebSerial nur in Chrome/Edge verfügbar.', 'err');
      return;
    }
    try{
      stopRead=false;
      port = await navigator.serial.requestPort();
      await port.open({ baudRate: state.settings.baudRate||19200, dataBits:8, stopBits:1, parity:'none', flowControl:'none' });
      state.usb.connected=true;
      state.usb.info=getPortInfo(port);
      saveState();
      setUsbUi(true);
      logLine('USB verbunden ' + (state.usb.info?('('+state.usb.info+')'):''));
      toast('USB','Verbunden.','ok');
      readLoop();
      setTimeout(()=>{ try{ mrcWriteLine('CMD_INIT'); }catch{} try{ requestMrcSync('usb-connect'); }catch{} }, 120);
    }catch(e){
      toast('USB','Verbindung fehlgeschlagen/abgebrochen: ' + String(e?.message||e), 'err');
      logLine('USB Fehler: ' + String(e?.message||e));
      await usbDisconnect();
    }
  }

  async function usbDisconnect(){
    try{
      stopRead=true;
      try{ if(reader){ await reader.cancel(); reader.releaseLock(); } }catch{}
      reader=null;
      try{ if(port){ await port.close(); } }catch{}
      port=null;
    } finally {
      state.usb.connected=false;
      state.usb.info='';
      saveState();
      setUsbUi(false);
      logLine('USB getrennt');
      toast('USB','Getrennt.','warn');
    }
  }

  async function readLoop(){
    const dec = new TextDecoder('utf-8');
    let buf='';
    while(port?.readable && !stopRead){
      reader = port.readable.getReader();
      try{
        while(!stopRead){
          const {value,done} = await reader.read();
          if(done) break;
          if(value){
            buf += dec.decode(value, {stream:true});
            let idx;
            while((idx = buf.indexOf('\n')) >= 0){
              const line = buf.slice(0, idx).trim();
              buf = buf.slice(idx+1);
              if(line) onSerialLine(line);
            }
          }
        }
      } catch(e){
        logLine('USB Read Fehler: ' + String(e?.message||e));
      } finally {
        try{ reader.releaseLock(); }catch{}
        reader=null;
      }
    }
  
// If the loop ends unexpectedly (port closed), try to reconnect
if(!stopRead){
  state.usb.connected=false;
  saveState();
  setUsbUi(false);
  scheduleUsbReconnect('readloop-end');
}
}

  function onSerialLine(line){
    logLine('SERIAL: ' + line);
    if(handleMrcMetaLine(line)) return;
    const m = /^\s*\d+\s*,\s*([0-9A-Fa-f]+)\s*,\s*(\d+)\s*$/.exec(line);
    if(!m) return;
    updateMrcCounterFromLine(line);
    const chip = m[1].toUpperCase();
    const ts = parseInt(m[2], 10);
    updateMrcClock(ts, 'pass');
    enqueuePass(chip, ts, line);
  }

  
  // --------------------- Pass queue (messkritischer Kern zuerst) ---------------------
  let passQueue = [];
  let passQueueBusy = false;

  function enqueuePass(chip, ts, rawLine=''){
    passQueue.push({ chip, ts, rawLine });
    if(passQueueBusy) return;
    passQueueBusy = true;
    setTimeout(processPassQueue, 0);
  }

  function processPassQueue(){
    try{
      // Work through a small batch, then yield back to the browser.
      let n = 0;
      while(passQueue.length && n < 12){
        const item = passQueue.shift();
        try{
          handlePass(item.chip, item.ts);
        }catch(e){
          logLine('Pass-Queue Fehler: ' + String(e?.message||e));
        }
        n++;
      }
    } finally {
      if(passQueue.length){
        setTimeout(processPassQueue, 0);
      } else {
        passQueueBusy = false;
      }
    }
  }

// --------------------- RunLog collapse + resize ---------------------
  function loadUi(){
    const w = window.innerWidth || 1600;
    try{
      const raw = localStorage.getItem(LS_UI);
      const base = raw ? JSON.parse(raw) : {};
      const ui = { logW: Number(base.logW||760), logCollapsed: !!base.logCollapsed };

      // On normal desktop widths we default to EXPANDED.
      // (Users kept getting "stuck" in collapsed mode.)
      if(w >= 1100){
        ui.logCollapsed = false;
      } else if(w < 900){
        ui.logCollapsed = true;
      }

      return ui;
    }catch{
      return { logW: 760, logCollapsed: (w < 900) };
    }
  }
  const ui = loadUi();
  function saveUi(){ localStorage.setItem(LS_UI, JSON.stringify(ui)); }

  function applyLogUi(){
    const root = document.getElementById('layoutRoot');

    // Keep layout usable: avoid an oversized log pane squeezing the main content.
    const w = window.innerWidth || 1600;

    // Hard caps
    const minLogW = 240;
    const maxLogW = Math.max(560, Math.min(960, Math.floor(w * 0.5)));
    ui.logW = clamp(ui.logW, minLogW, maxLogW);

    // If screen is very narrow (mobile), auto-collapse log.
    // Do NOT force-collapse on normal laptop widths; user toggle should win.
    if(w < 900){
      ui.logCollapsed = true;
    }
    if(ui.logCollapsed){
      root.classList.add('collapsed');
    } else {
      root.classList.remove('collapsed');
      root.style.setProperty('--logw', ui.logW + 'px');
    }

    const btn = document.getElementById('btnToggleLog');
    const dockBtn = document.getElementById('btnToggleLogDock');
    if(btn) btn.textContent = ui.logCollapsed ? 'Log ▸' : 'Log ◂';
    if(btn) btn.title = ui.logCollapsed ? 'Run Log ausklappen' : 'Run Log einklappen';
    if(dockBtn){
      dockBtn.textContent = ui.logCollapsed ? 'Log ▸' : 'Log ◂';
      dockBtn.title = ui.logCollapsed ? 'Run Log ausklappen' : 'Run Log einklappen';
    }
    saveUi();
  }

  function wireLogResizer(){
    const res = document.getElementById('logResizer');
    let dragging=false, startX=0, startW=ui.logW;
    res.addEventListener('mousedown',(e)=>{
      if(ui.logCollapsed) return;
      dragging=true; startX=e.clientX; startW=ui.logW;
      document.body.style.userSelect='none';
    });
    window.addEventListener('mouseup',()=>{
      if(!dragging) return;
      dragging=false;
      document.body.style.userSelect='';
      saveUi();
    });
    window.addEventListener('mousemove',(e)=>{
      if(!dragging) return;
      const dx = startX - e.clientX;
      const w = window.innerWidth || 1600;
      ui.logW = clamp(startW + dx, 240, Math.max(560, Math.min(960, Math.floor(w * 0.5))));
      applyLogUi();
    });
  }

  // --------------------- Rendering ---------------------
  function renderTopMenu(){
    const menu = document.getElementById('topMenu');
    menu.innerHTML='';
    for(const tab of TABS){
      const b = document.createElement('div');
      b.className = 'tab' + (state.ui.activeTab===tab.key?' active':'');
      b.textContent = t('tab.' + tab.page, null, tab.key);
      b.onclick = ()=>{ state.ui.activeTab=tab.key; saveState(); renderAll(); };
      menu.appendChild(b);
    }
  }
  function showActivePage(){
    for(const t of TABS){
      const el = document.getElementById(t.page);
      if(el) el.classList.toggle('active', state.ui.activeTab===t.key);
    }
  }
  function renderHeader(){
    document.getElementById('brandTitle').textContent = state.settings.appName || 'Zeitnahme 2.0';
    const sub=document.getElementById('brandSub');
if(sub) sub.textContent = t('header.subtitle', { build:BUILD }, 'offline • HTML/JS/CSS • build ' + BUILD);
    setUsbUi(state.usb.connected);
    setBleUi(state.ble.connected);
  }
  
  function getEnduranceStatusRows(){
    const teams = state.modes.endurance?.teams || [];
    const rid = state.session.currentRaceId || '';
    const activeMap = state.modes.endurance?.activeByTeamId || {};
    return teams.map(t=>{
      const ai = activeMap[t.id] || null;
      const d = ai?.driverId ? getDriver(ai.driverId) : null;
      const car = ai?.carId ? getCar(ai.carId) : null;
      const stint = ai ? Math.max(0, parseInt(ai.stintLaps||0,10) || 0) : 0;
      const rule = rid ? getEnduranceRuleStateForTeam(t.id, rid) : { compliant:true, invalidStintCount:0, statusText:'OK' };
      return {
        teamId:t.id,
        teamName:t.name||'Team',
        driverName:d?.name||'—',
        carName:car?.name||'—',
        stint,
        minStint: rule.minStint || 0,
        maxStint: rule.maxStint || 0,
        compliant: !!rule.compliant,
        invalidStintCount: rule.invalidStintCount||0,
        statusText: rule.statusText || 'OK'
      };
    });
  }

  function renderEnduranceStatusHtml(){
    const rows = getEnduranceStatusRows();
    if(!rows.length) return '';
    return `
      <div class="card" style="margin-bottom:12px">
        <div class="card-h"><h2>${esc(t('endurance.status_title'))}</h2></div>
        <div class="card-b">
          <table class="table">
            <thead><tr><th>${esc(t('common.team'))}</th><th>${esc(t('endurance.active_driver'))}</th><th>${esc(t('endurance.stint'))}</th><th>${esc(t('endurance.status'))}</th><th>${esc(t('endurance.car'))}</th></tr></thead>
            <tbody>
            ${rows.map(r=>`<tr><td>${esc(r.teamName)}</td><td>${esc(r.driverName)}</td><td>${r.stint} / ${esc(t('endurance.min_label'))} ${r.minStint}${r.maxStint>0 ? ' / '+esc(t('endurance.max_label'))+' '+r.maxStint : ''}</td><td>${r.compliant?'<span class="ok">'+esc(t('endurance.status_ok'))+'</span>':'<span class="err">'+esc(r.statusText||t('endurance.rule_violation'))+'</span>'}</td><td>${esc(r.carName)}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

function renderSessionControl(){
    const ampelActive = !!ampelRunning || !!state.ui?.ampel?.visible;
    const sessionStateLabel = ampelActive ? 'AMPEL' : state.session.state;
    const setText = (id, value)=>{
      const node = document.getElementById(id);
      if(node) node.textContent = value;
    };
    setText('scTitle', t('session.title'));
    setText('quickStatusTitle', t('session.quick_status'));
    setText('scLabelTimer', t('session.timer'));
    setText('scLabelMode', t('session.current_mode'));
    setText('scLabelTrack', t('session.track'));
    setText('scLabelMinLap', t('session.minimum_time'));
    setText('scLabelTrackRecord', t('session.track_record'));
    setText('scLabelDayRecord', t('session.day_record'));
    setText('scLabelFreeDriving', t('session.free_driving'));
    setText('scFreeDrivingDesc', t('session.free_driving_desc'));
    setText('scAmpelTitle', t('session.start_light'));
    setText('scAmpelBeforeLabel', t('session.start_light_before'));
    setText('scAmpelSequence', t('session.start_light_sequence'));
    setText('scControlHint', t('session.control_hint'));
    setText('btnStart', t('session.start'));
    setText('btnPause', t('session.pause'));
    setText('btnResume', t('session.resume'));
    setText('btnStop', t('session.stop'));
    setText('btnFreeDrivingOn', t('session.on'));
    setText('btnFreeDrivingOff', t('session.off'));
    const badgeSessionState = document.getElementById('badgeSessionState');
    if(badgeSessionState){
      badgeSessionState.textContent = sessionStateLabel;
      badgeSessionState.dataset.state = sessionStateLabel;
    }
    document.getElementById('scMode').textContent = getModeLabel();
    const track = getActiveTrack();
    document.getElementById('scTrack').textContent = formatTrackDisplayName(track);
    document.getElementById('scMinLap').textContent = track ? msToTime(track.minLapMs, 3) : '—';
    const rec = getTrackRecord(track);
    document.getElementById('scRecordTime').textContent = rec?.ms!=null ? msToTime(rec.ms, 3) : '—';
    document.getElementById('scRecordName').textContent =
      rec?.ms!=null ? `${(rec.driverId ? (getDriver(rec.driverId)?.name||rec.driverName) : rec.driverName)||'Unbekannt'} • ${rec.carName||''}` : '—';

    // Renntag-Rekord (Tagesrekord) – nur wenn Renntag zur aktuellen Strecke passt
    const rd = getActiveRaceDay();
    let dayRec = null;
    if(rd && track){
      dayRec = getRaceDayTrackRecord(rd, track.id);
    }
    const dTime = document.getElementById('scDayRecordTime');
    const dName = document.getElementById('scDayRecordName');
    if(dTime && dName){
      dTime.textContent = dayRec?.ms!=null ? msToTime(dayRec.ms, 3) : '—';
      dName.textContent = dayRec?.ms!=null ? `${(dayRec.driverId ? (getDriver(dayRec.driverId)?.name||dayRec.driverName) : dayRec.driverName)||'Unbekannt'} • ${dayRec.carName||''}` : '—';
    }

    document.getElementById('btnStart').disabled = (state.session.state!=='IDLE') || ampelActive;
    document.getElementById('btnPause').disabled = (state.session.state!=='RUNNING');
    document.getElementById('btnResume').disabled = (state.session.state!=='PAUSED');
    document.getElementById('btnStop').disabled = (state.session.state==='IDLE');

    const btnFreeDrivingOn = document.getElementById('btnFreeDrivingOn');
    const btnFreeDrivingOff = document.getElementById('btnFreeDrivingOff');
    const freeDrivingState = document.getElementById('scFreeDrivingState');
    const useAmpelChk = document.getElementById('scUseAmpel');
    const ampelWrap = document.getElementById('scAmpelWrap');
    const freeDrivingPending = !!state.ui.freeDrivingEnabled && !state.session.isFreeDriving;
    const freeDrivingActive = !!state.session.isFreeDriving || !!state.ui.freeDrivingEnabled;
    if(btnFreeDrivingOn) btnFreeDrivingOn.disabled = freeDrivingActive || state.session.state!=='IDLE';
    if(btnFreeDrivingOff) btnFreeDrivingOff.disabled = !freeDrivingActive;
    if(freeDrivingState) freeDrivingState.textContent = state.session.isFreeDriving ? t('session.on') : (freeDrivingPending ? t('session.waiting_for_start') : t('session.off'));
    if(useAmpelChk){
      useAmpelChk.checked = !!state.settings.useAmpel;
      useAmpelChk.disabled = freeDrivingActive || state.session.state!=='IDLE' || ampelActive;
    }
    if(ampelWrap){
      ampelWrap.style.opacity = freeDrivingActive ? '0.55' : '1';
      ampelWrap.classList.toggle('is-running', ampelActive);
    }

    document.getElementById('badgeSeason').textContent = t('badge.season', { name:(getActiveSeason()?.name || '—') });
    document.getElementById('badgeRaceDay').textContent = t('badge.raceday', { name:(getActiveRaceDay()?.name || '—') });
    const isEndurance = (state.modes.activeMode==='endurance') || (state.session.currentRaceId && getActiveRaceDay()?.races?.find(r=>r.id===state.session.currentRaceId)?.mode==='endurance');
    const endBox = document.getElementById('scEnduranceBox');
    const endHr = document.getElementById('scEnduranceHr');
    const endStatus = document.getElementById('scEnduranceStatus');
    if(endBox && endHr && endStatus){
      endBox.style.display = isEndurance ? '' : 'none';
      endHr.style.display = isEndurance ? '' : 'none';

      const minStint = Math.max(0, parseInt(state.modes.endurance?.minStintLaps||0,10) || 0);
      const maxStint = Math.max(0, parseInt(state.modes.endurance?.maxStintLaps||0,10) || 0);
      const rows = getEnduranceStatusRows();
      const teamText = rows.length
        ? rows.map(r=>`${esc(r.teamName)}: ${esc(r.driverName)} (${r.stint}/min ${r.minStint}${r.maxStint>0 ? '/max '+r.maxStint : ''})`).join(' • ')
        : 'Keine Teams.';
      const rulesText = esc(`Stint-Regeln: min ${minStint}${maxStint>0 ? ' / max '+maxStint : ''}`);
      endStatus.innerHTML = `${rulesText}<br>${teamText}`;
    }

  }

  function renderDashboard(){
    const el = document.getElementById('pageDashboard');
    const liveRaceId = state.session.currentRaceId || '';
    const podiumRaceId = state.ui.podiumRaceId || '';
    const raceId = liveRaceId || podiumRaceId || '';
    const rd = getActiveRaceDay();
    const race = (raceId && rd) ? rd.races.find(r=>r.id===raceId) : null;
    const raceMode = race?.mode || null;
    const loopPhase = (state.loop?.phase || state.session.loopPhase || '').toString().toUpperCase();
    const inRace = !!liveRaceId && !isFreeDrivingRace(race) && (race?.submode!=='Training') && (raceMode!=='loop' || loopPhase==='RACE');
    const postRaceResultMode = !liveRaceId && !!podiumRaceId && !!race && raceShouldShowPodium(race);
    const hasTeamishMode = (raceMode==='team' || raceMode==='endurance' || state.modes.activeMode==='team' || state.modes.activeMode==='endurance');
    const showEnduranceStatus = ((raceMode==='endurance') || state.modes.activeMode==='endurance' || Object.keys(state.modes.endurance?.activeByTeamId||{}).length>0);

    // UI prefs (persisted)
    const viewPref = state.ui.dashboardView || 'auto'; // auto | race | drivers | live | teams
    let view = viewPref==='auto'
      ? ((inRace || postRaceResultMode) ? ((raceMode==='team' || raceMode==='endurance') ? 'teams' : 'race') : (hasTeamishMode ? 'teams' : 'drivers'))
      : viewPref;
    if(view==='race' && !(inRace || postRaceResultMode)) view='drivers';
    if(view==='teams' && !hasTeamishMode) view = (inRace || postRaceResultMode) ? 'race' : 'drivers';

    const sortPref = state.ui.dashboardSort || 'best'; // best | last | name
    const showLiveFallback = (state.ui.dashboardShowLiveFallback !== false);

    const idleMode = (!raceId && state.session.state==='IDLE');
    const lapsAll = idleMode ? (state.session.idleLaps||[]) : state.session.laps;
    const relevantLapsRaw = raceId
      ? (postRaceResultMode
          ? (lapsAll||[]).filter(l=>l && l.raceId===raceId)
          : getRelevantRaceLaps(raceId, lapsAll))
      : lapsAll;
    // Live-Rundenzahl darf nie durch Darstellungsfilter verfälscht werden.
    // Deshalb für Dashboard immer alle rennrelevanten Laps verwenden.
    const relevantLaps = (relevantLapsRaw||[]);

    // --- build views ---
    function driverKeyForLap(l){
      const car = l.carId ? getCar(l.carId) : null;
      const did = (l.driverId || car?.driverId || '').trim();
      return did || '__unknown__';
    }
    function driverNameById(id){
      if(id==='__unknown__') return t('dashboard.unknown');
      const d = getDriver(id);
      return d?.name || t('dashboard.unknown');
    }
    function carNameForLap(l){
      const car = l.carId ? getCar(l.carId) : null;
      return car?.name || '—';
    }
    function getLatestCarIdForDriver(driverId, laps){
      const arr = (laps||[]).filter(l=>driverKeyForLap(l)===driverId && l.carId);
      if(!arr.length) return '';
      arr.sort((a,b)=>(b.ts||0)-(a.ts||0));
      return arr[0]?.carId || '';
    }
    // --------------------- Podium (after race) ---------------------
    function computeDriverStandings(laps){
      const map = new Map();
      laps.forEach(l=>{
        const id = driverKeyForLap(l);
        if(!map.has(id)){
          map.set(id,{ id, name: driverNameById(id), laps:0, totalMs:0, bestMs:null, lastMs:null, lastTs:0, finished:false });
        }
        const s = map.get(id);
        s.laps++;
        s.totalMs += (l.lapMs||0);
        if(s.bestMs==null || l.lapMs < s.bestMs) s.bestMs = l.lapMs;
        if(l.ts && l.ts >= (s.lastTs||0)){
          s.lastTs = l.ts;
          s.lastMs = l.lapMs;
        }
      });
      const arr = Array.from(map.values());
      for(const s of arr){ s.finished = isDriverFinished(s.id); }
arr.sort((a,b)=>{
        // Placement: laps DESC, total time ASC (tie-breaker), then best lap ASC
        if(b.laps!==a.laps) return b.laps-a.laps;

        const at = a.totalMs==null ? 9e15 : a.totalMs;
        const bt = b.totalMs==null ? 9e15 : b.totalMs;
        if(at!==bt) return at-bt;

        const ab = a.bestMs==null ? 9e15 : a.bestMs;
        const bb = b.bestMs==null ? 9e15 : b.bestMs;
        if(ab!==bb) return ab-bb;

        const al = a.lastMs==null ? 9e15 : a.lastMs;
        const bl = b.lastMs==null ? 9e15 : b.lastMs;
        return al-bl;
      });
      return arr;
    }

    function computeTeamStandings(laps, mode, finish){
      const teams = (mode==='team') ? (state.modes.team?.teams||[]) : (state.modes.endurance?.teams||[]);
      const raceId = (laps && laps[0] && laps[0].raceId) ? laps[0].raceId : (state.session.currentRaceId || '');
      const rows = teams.map(t=>{
        const driverIds = (t.driverIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
        const carIds = new Set();
        driverIds.forEach(did=>{
          getCarsByDriver(did).forEach(c=>carIds.add(c.id));
        });
        const tlaps = laps.filter(l=>{
          if(!l) return false;
          if(l.carId && carIds.has(l.carId)) return true;
          return l.driverId && driverIds.includes(String(l.driverId));
        }).sort((a,b)=>a.ts-b.ts);
        const raceOnly = tlaps.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
        const rel = raceOnly.length ? raceOnly : tlaps;
        const lapCount = rel.length;
        const totalMs = rel.reduce((s,l)=>s+(l.lapMs||0),0);
        const bestMs = lapCount ? Math.min(...rel.map(l=>l.lapMs||Infinity)) : null;
        const lastMs = lapCount ? rel[rel.length-1].lapMs : null;
        const members = driverIds.map(id=>driverNameById(id)).join(', ') || '—';
        let finished = false;
        if(finish && finish.pending && finish.activeCarIds && finish.finishedCarIds){
          const active = (finish.activeCarIds||[]).filter(cid=>carIds.has(cid));
          if(active.length){
            finished = active.every(cid=>!!finish.finishedCarIds[cid]);
          }
        }
        const raceTotal = raceId ? getTeamRaceTotalFromStartMs(raceId, t.id, mode, rel) : totalMs;
        const rule = (mode==='endurance' && raceId) ? getEnduranceRuleStateForTeam(t.id, raceId) : { compliant:true, invalidStintCount:0, statusText:'OK', minStint:0, stints:[], penaltySecondsTotal:0, deductedLaps:0, projectedDeductedLaps:0 };
        return {
          id:t.id,
          name:t.name||'Team',
          members,
          rawLapCount: lapCount,
          rawTotalMs: (raceTotal==null ? totalMs : raceTotal),
          lapCount: mode==='endurance' ? Math.max(0, lapCount - (rule.deductedLaps||0)) : lapCount,
          totalMs: mode==='endurance' ? (((raceTotal==null ? totalMs : raceTotal) || 0) + ((rule.penaltySecondsTotal||0) * 1000)) : (raceTotal==null ? totalMs : raceTotal),
          bestMs,
          lastMs,
          finished,
          compliant: mode==='endurance' ? !!rule.compliant : true,
          invalidStintCount: mode==='endurance' ? (rule.invalidStintCount||0) : 0,
          statusText: mode==='endurance' ? (rule.statusText||'OK') : 'OK',
          penaltySecondsTotal: mode==='endurance' ? (rule.penaltySecondsTotal||0) : 0,
          deductedLaps: mode==='endurance' ? (rule.deductedLaps||0) : 0,
          projectedDeductedLaps: mode==='endurance' ? (rule.projectedDeductedLaps||0) : 0
        };
      });
      rows.sort((a,b)=>{
        if(b.lapCount!==a.lapCount) return b.lapCount-a.lapCount;
        return (a.totalMs||0)-(b.totalMs||0);
      });
      return rows;
    }


function buildPodiumConfettiHtml(){
  const pieces = [];
  for(let i=0;i<54;i++){
    const left = (2 + (i*1.83)%96).toFixed(2);
    const delay = (i*0.06).toFixed(2);
    const dur = (2.4 + (i%6)*0.18).toFixed(2);
    const drift = (((i%2===0)?1:-1) * (18 + (i%7)*8));
    const x = (((i%3)-1) * (8 + (i%5)*3));
    const fall = 280 + (i%8)*22;
      pieces.push(`<i style="left:${left}%;--delay:${delay}s;--dur:${dur}s;--drift:${drift}px;--x:${x}px;--fall:${fall}px"></i>`);
  }
  return `<div class="podiumConfetti" aria-hidden="true">${pieces.join('')}</div>`;
}

    function renderPodiumSection(podiumRace){
      const mode = podiumRace?.mode || 'single';
      const laps = state.session.laps.filter(l=>l.raceId===podiumRace.id);
      const dec = 3;
      // Finish-window status (used to show 🏁 when a driver/team has completed)
      const finish = (state.session.finish && state.session.finish.pending) ? state.session.finish : null;

      const finishedCarIds = new Set();
      const finishedDriverIds = new Set();
      if(finish && finish.finishedCarIds){
        for(const carId of Object.keys(finish.finishedCarIds)){
          finishedCarIds.add(carId);
          const c = getCar(carId);
          const did = (c?.driverId||'').trim();
          if(did) finishedDriverIds.add(did);
        }
      }
      let standings = [];
      let isTeams = (mode==='team' || mode==='endurance');
      if(isTeams){
        standings = computeTeamStandings(laps, mode, finish);
      } else {
        standings = computeDriverStandings(laps);
      }

      const top = standings.slice(0,3).map(x=> isTeams ? ({...x, isTeam:true}) : x);
      const rest = standings.slice(3).map(x=> isTeams ? ({...x, isTeam:true}) : x);

      function box(pos, data){
        if(!data){
          return `<div class="podiumStep p${pos}">
            <div class="podiumPos">${pos}</div>
            <div class="podiumName muted">—</div>
          </div>`;
        }
        if(isTeams){
          return `<div class="podiumStep p${pos}">
            <div class="podiumPos">${pos}</div>
            <div class="podiumProfile">
              ${(()=>{const nm=(data.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return `<div class=\"podiumThumb podiumThumbPlaceholder\"><span>${esc(ini||'?')}</span></div>`;})()}
              <div class="podiumInfoCol">
                <div class="podiumName"><span class="nm">${esc(data.name)}</span>${data.finished?'<span class="finishFlag">🏁</span>':''}</div>
                <div class="podiumSub small muted">${esc(data.members)}</div>
                <div class="podiumStats small">
                  <div><span>Runden</span><b>${data.lapCount}</b></div>
                  <div><span>Zeit</span><b class="mono">${data.totalMs?msToTime(data.totalMs, dec):'—'}</b></div>
                </div>
              </div>
            </div>
          </div>`;
        } else {
          return `<div class="podiumStep p${pos}">
            <div class="podiumPos">${pos}</div>
            <div class="podiumProfile">
              ${(()=>{const url=getDriverAvatarDataUrl(data.id);const nm=(data.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"podiumThumb\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"podiumThumb podiumThumbPlaceholder\"><span>${esc(ini||'?')}</span></div>`;})()}
              <div class="podiumInfoCol">
                <div class="podiumName"><span class="nm">${esc(data.name)}</span>${data.finished?'<span class="finishFlag">🏁</span>':''}</div>
                <div class="podiumStats small">
                  <div><span>Runden</span><b>${data.laps}</b></div>
                  <div><span>Zeit</span><b class="mono">${data.totalMs?msToTime(data.totalMs, dec):'—'}</b></div>
                  <div><span>Best</span><b class="mono">${data.bestMs!=null?msToTime(data.bestMs, dec):'—'}</b></div>
                </div>
              </div>
            </div>
          </div>`;
        }
      }

      const podiumHtml = `
        <div class="card podiumCard">
          ${buildPodiumConfettiHtml()}
          <div class="row" style="align-items:center; justify-content:space-between; gap:12px;">
            <div>
              <div class="title">🏁 Siegerpodest</div>
              <div class="muted small">${esc(podiumRace.name||'Rennen')} • beendet ${new Date(podiumRace.endedAt).toLocaleString('de-DE')}</div>
            </div>
            <button class="btn" id="btnClosePodium">Schließen</button>
          </div>

          <div class="podiumWrap">
            <div class="podiumCol second">${box(2, top[1])}</div>
            <div class="podiumCol first">${box(1, top[0])}</div>
            <div class="podiumCol third">${box(3, top[2])}</div>
          </div>

          <div class="hr"></div>

          ${isTeams ? `
            <div class="muted">Restliche Plätze</div>
            <table class="table dashBig">
              <thead><tr><th>#</th><th>Team</th><th>Runden</th><th>Gesamtzeit</th><th>Best</th><th>Ø km/h</th><th>Letzte</th></tr></thead>
              <tbody>
                ${rest.map((t,i)=>`<tr>
                  <td class="mono">${i+4}</td>
                  <td><b>${esc(t.name)}</b><div class="muted tiny">${esc(t.members)}</div>${(mode==='endurance' && t.compliant===false)?`<div class="tiny" style="color:#ff8f8f">${esc(t.statusText||'Regelverstoss')}</div>`:''}</td>
                  <td class="mono">${t.lapCount}</td>
                  <td class="mono">${t.totalMs?msToTime(t.totalMs, dec):'—'}</td>
                  <td class="mono">${t.bestMs!=null && isFinite(t.bestMs)?msToTime(t.bestMs, dec):'—'}</td>
                  <td class="mono">${t.lastMs!=null && isFinite(t.lastMs)?msToTime(t.lastMs, dec):'—'}</td>
                </tr>`).join('') || `<tr><td colspan="6" class="muted">—</td></tr>`}
              </tbody>
            </table>
          ` : `
            <div class="muted">Restliche Plätze</div>
            <table class="table dashBig">
              <thead><tr><th>#</th><th>Fahrer</th><th>Runden</th><th>Gesamtzeit</th><th>Best</th><th>Ø km/h</th><th>Letzte</th></tr></thead>
              <tbody>
                ${rest.map((s,i)=>`<tr>
                  <td class="mono">${i+4}</td>
                  <td><div class="nameCell">${(()=>{const url=getDriverAvatarDataUrl(s.id);const nm=(s.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"avatar\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"avatar fallback\">${esc(ini||'?')}</div>`;})()}<span class="nm">${esc(s.name)}</span>${s.finished?'<span class="finishFlag">🏁</span>':''}</div></td>
                  <td class="mono">${s.laps}</td>
                  <td class="mono">${s.totalMs?msToTime(s.totalMs, dec):'—'}</td>
                  <td class="mono">${s.bestMs!=null?msToTime(s.bestMs, dec):'—'}</td>
                  <td class="mono">${s.lastMs!=null?msToTime(s.lastMs, dec):'—'}</td>
                </tr>`).join('') || `<tr><td colspan="5" class="muted">—</td></tr>`}
              </tbody>
            </table>
          `}
        </div>
      `;

      return podiumHtml;
    }


    // Live laps table (existing)
    function renderLive(){
      const laps = relevantLaps.slice(-40).reverse();
      const rows = laps.map(l=>{
        const car = getCar(l.carId);
        const driver = l.driverId ? getDriver(l.driverId) : null;
        const name = driver?.name || (car?.driverId ? getDriverSpeakName(car.driverId) : '') || getDriverNameForCar(car) || t('dashboard.unknown');
        const carName = car?.name || '—';
        return `<tr><td>${esc(name)}</td><td>${esc(carName)}</td><td class="mono">${esc(msToTime(l.lapMs, 3))}</td><td class="small">${esc(l.phase||'')}</td></tr>`;
      }).join('');
      return `
        <div class="muted">${t('dashboard.live_intro')}</div>
        <div class="hr"></div>
        <table class="table dashBig">
          <thead><tr><th>${t('dashboard.driver')}</th><th>${t('dashboard.car')}</th><th>${t('dashboard.lap')}</th><th>${t('dashboard.phase')}</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="5" class="muted">${t('dashboard.no_laps')}</td></tr>`}</tbody>
        </table>
      `;
    }


    // Team overview (Teamrennen + Langstrecke)
    function renderTeams(){
      const teams = (raceMode==='team') ? (state.modes.team?.teams||[]) : (state.modes.endurance?.teams||[]);
      if(!teams.length){
        return `<div class="muted">${t('dashboard.no_teams')}</div>`;
      }
      const teamRows = computeTeamStandingsGlobal(relevantLaps.filter(l=>!raceId || l.raceId===raceId), raceMode, (state.session.finish?.pending?state.session.finish:null));
      const rowsHtml = teamRows.map((t,i)=>{
        const pos = i+1;
        const status = (raceMode==='endurance') ? (t.compliant===false ? `<span class="pill bad">Strafe</span><div class="muted tiny">${esc(t.statusText||'')}</div>` : `<span class="pill ok">OK</span>`) : '';
        return `<tr>
          <td class="mono">${pos}</td>
          <td><b>${esc(t.name)}</b><div class="muted tiny">${esc(t.members)}</div>${status}</td>
          <td class="mono">${t.lapCount}</td>
          <td class="mono">${t.totalMs?msToTime(t.totalMs, 3):'—'}</td>
          <td class="mono">${t.bestMs!=null && isFinite(t.bestMs)?msToTime(t.bestMs, 3):'—'}</td>
          <td class="mono">${formatKmh(lapMsToAverageKmh(t.bestMs, getActiveTrack()))}</td>
          <td class="mono">${t.lastMs!=null && isFinite(t.lastMs)?msToTime(t.lastMs, 3):'—'}</td>
        </tr>`;
      }).join('');

      return `
        <div class="muted">${t('dashboard.team_intro')} ${raceMode==='endurance' ? t('dashboard.team_intro_endurance') : t('dashboard.team_intro_regular')}</div>
        <div class="hr"></div>
        <table class="table dashBig">
          <thead><tr><th>#</th><th>${t('dashboard.team')}</th><th>${t('dashboard.laps')}</th><th>${t('dashboard.total_time')}</th><th>${t('dashboard.best')}</th><th>${t('dashboard.last')}</th></tr></thead>
          <tbody>${rowsHtml || `<tr><td colspan="7" class="muted">${t('dashboard.no_team_laps')}</td></tr>`}</tbody>
        </table>
      `;
    }

    // Driver overview (best + last)
    function buildDriverStats(){
      const map = new Map(); // id -> {id,name,lastMs,lastTs,bestMs,lapsCount}
      const raceIdNow = raceId || '';
      // Finish-window status (used to show 🏁)
      const finish = (state.session.finish && state.session.finish.pending) ? state.session.finish : null;
      const finishedDriverIds = new Set();
      if(finish && finish.finishedCarIds){
        for(const carId of Object.keys(finish.finishedCarIds)){
          const c = getCar(carId);
          const did = (c?.driverId||'').trim();
          if(did) finishedDriverIds.add(did);
        }
      }

      function touch(id){
        if(!map.has(id)){
          map.set(id, { id, name: driverNameById(id), lastMs:null, lastTs:0, bestMs:null, lapsCount:0, totalMs:null, finished:false });
        }
        return map.get(id);
      }

      // ensure all known drivers exist in list (even w/o laps)
      if(!inRace){
        state.masterData.drivers.forEach(d=>touch(d.id));
      }

      const rl0 = (relevantLaps||[]).filter(l=>l && l.lapMs!=null);
      const raceOnly = rl0.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
      const rl = raceOnly.length ? raceOnly : rl0;
      rl.forEach(l=>{
        const id = driverKeyForLap(l);
        const s = touch(id);
        s.lapsCount++;
        if(s.bestMs==null || l.lapMs < s.bestMs) s.bestMs = l.lapMs;
        if(l.ts && l.ts >= (s.lastTs||0)){
          s.lastTs = l.ts;
          s.lastMs = l.lapMs;
        }
      });

      // sort
      const arr = Array.from(map.values());
      for(const s of arr){
        if(raceIdNow){
          const rt = getDriverRaceTotalFromStartMs(raceIdNow, s.id, rl);
          if(rt!=null) s.totalMs = rt;
        }
      }
      for(const s of arr){ s.finished = isDriverFinished(s.id); }
      if(inRace || postRaceResultMode){
        const liveRaceRows = !!(raceIdNow && raceIdNow===state.session.currentRaceId && state.session.state==='RUNNING' && !(state.session.finish&&state.session.finish.pending));
        sortDriverStandingRows(arr, race, { live: liveRaceRows });
      } else {
        arr.sort((a,b)=>{
          if(sortPref==='name') return (a.name||'').localeCompare(b.name||'', getUiLocale());
          if(sortPref==='last'){
            const av = a.lastMs==null ? 9e15 : a.lastMs;
            const bv = b.lastMs==null ? 9e15 : b.lastMs;
            if(av!==bv) return av-bv;
            const ab = a.bestMs==null ? 9e15 : a.bestMs;
            const bb = b.bestMs==null ? 9e15 : b.bestMs;
            return ab-bb;
          }
          const av = a.bestMs==null ? 9e15 : a.bestMs;
          const bv = b.bestMs==null ? 9e15 : b.bestMs;
          if(av!==bv) return av-bv;
          const al = a.lastMs==null ? 9e15 : a.lastMs;
          const bl = b.lastMs==null ? 9e15 : b.lastMs;
          return al-bl;
        });
      }
      return arr;
    }

    function renderDrivers(){
      const stats = buildDriverStats();
      const rows = stats.map((s,idx)=>{
        const drv = getDriver(s.id) || null;
        const bg = drv?.color || '';
        const tc = bg ? (drv?.colorAutoText!==false ? pickTextColorForBg(bg) : (drv?.textColor||pickTextColorForBg(bg))) : '';
        const style = bg ? ` style=\"background:${bg};color:${tc}\"` : '';
        return `
        <tr${style}>
          ${inRace ? `<td>${idx+1}</td>` : ``}
          <td><div class="nameCell">${(()=>{const url=getDriverAvatarDataUrl(s.id);const nm=(s.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"avatar\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"avatar fallback\">${esc(ini||'?')}</div>`;})()}<span class="nm">${esc(s.name)}</span>${s.finished?'<span class="finishFlag">🏁</span>':''}</div></td>
          <td class="mono">${s.lastMs!=null ? esc(msToTime(s.lastMs, 3)) : '—'}</td>
          <td class="mono">${s.bestMs!=null ? esc(msToTime(s.bestMs, 3)) : '—'}</td>
          <td class="mono">${esc(formatMrcDeltaMs(getMrcDeltaForCar(getLatestCarIdForDriver(s.id, relevantLaps) || getCarsByDriver(s.id)?.[0]?.id || '')))}</td>
          <td class="mono">${esc(formatKmh(lapMsToAverageKmh(s.bestMs, getActiveTrack())))}</td>
          ${inRace ? `<td class="mono">${s.totalMs!=null ? esc(msToTime(s.totalMs, 3)) : '—'}</td>` : ``}
          <td class="small">${s.lapsCount}</td>
        </tr>
      `;
      }).join('');
      return `
        <div class="muted">${inRace ? t('dashboard.driver_intro_race') : t('dashboard.driver_intro_idle')}</div>
        <div class="hr"></div>
        <table class="table dashBig">
          <thead><tr>${inRace?'<th>#</th>':''}<th>${t('dashboard.driver')}</th><th>${t('dashboard.last')}</th><th>${t('dashboard.best')}</th><th>${t('dashboard.mrc_delta')}</th><th>${t('dashboard.average_kmh')}</th>${inRace?`<th>${t('dashboard.total_time')}</th>`:''}<th class="small">${t('dashboard.laps')}</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="${inRace?8:6}" class="muted">${t('dashboard.no_driver_data')}</td></tr>`}</tbody>
        </table>
      `;
    }

    // Race standings (placement)
    function renderRace(){
      // Only use real race laps when available
      const rl0 = (relevantLaps||[]).filter(l=>l && l.lapMs!=null);
      const raceOnly = rl0.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
      const rl = raceOnly.length ? raceOnly : rl0;

      const raceIdNow = raceId || '';
      let arr = [];
      if(postRaceResultMode && raceIdNow){
        arr = buildFinalRaceRowsFromStandings(raceIdNow, rl, getActiveTrack()).map(x=>({
          id:x.driverId,
          name:x.name,
          laps:x.laps,
          totalMs:x.totalMs,
          bestMs:x.bestMs,
          lastMs:x.lastMs,
          finished:x.finished
        }));
      } else {
        // placement by laps desc, then total time asc (tie-breaker), then best lap asc
        const map = new Map();
        rl.forEach(l=>{
          const id = driverKeyForLap(l);
          if(!map.has(id)){
            map.set(id,{ id, name: driverNameById(id), laps:0, totalMs:0, bestMs:null, lastMs:null, lastTs:0, finished:false });
          }
          const s = map.get(id);
          s.laps++;
          s.totalMs += (l.lapMs||0);
          if(s.bestMs==null || l.lapMs < s.bestMs) s.bestMs = l.lapMs;
          if(l.ts && l.ts >= (s.lastTs||0)){
            s.lastTs = l.ts;
            s.lastMs = l.lapMs;
          }
        });
        arr = Array.from(map.values());
        for(const s of arr){
          s.finished = isDriverFinished(s.id);
          if(raceIdNow){
            const rt = getDriverRaceTotalFromStartMs(raceIdNow, s.id, rl);
            if(rt!=null) s.totalMs = rt;
          }
        }
        const liveRaceRows = !!(raceIdNow && raceIdNow===state.session.currentRaceId && state.session.state==='RUNNING' && !(state.session.finish&&state.session.finish.pending));
        sortDriverStandingRows(arr, race, { live: liveRaceRows });
      }
      const rows = arr.map((s,idx)=>`
        <tr>
          <td>${idx+1}</td>
          <td><div class="nameCell">${(()=>{const url=getDriverAvatarDataUrl(s.id);const nm=(s.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"avatar\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"avatar fallback\">${esc(ini||'?')}</div>`;})()}<span class="nm">${esc(s.name)}</span>${s.finished?'<span class="finishFlag">🏁</span>':''}</div></td>
          <td class="small">${s.laps}</td>
          <td class="mono">${s.totalMs!=null ? esc(msToTime(s.totalMs, 3)) : '—'}</td>
          <td class="mono">${s.bestMs!=null ? esc(msToTime(s.bestMs, 3)) : '—'}</td>
          <td class="mono">${esc(formatMrcDeltaMs(getMrcDeltaForCar(getLatestCarIdForDriver(s.id, rl) || '')))}</td>
          <td class="mono">${esc(formatKmh(lapMsToAverageKmh(s.bestMs, getActiveTrack())))}</td>
          <td class="mono">${s.lastMs!=null ? esc(msToTime(s.lastMs, 3)) : '—'}</td>
        </tr>
      `).join('');
      const body = rows || `<tr><td colspan="8" class="muted">${t('dashboard.no_race_laps')}</td></tr>`;
      const hint = showLiveFallback ? `<div class="muted small" style="margin-top:10px;">${t('dashboard.live_hint')}</div>` : '';
      const raceEndHighlights = (()=>{
        if(!postRaceResultMode || !race || race.mode==='team' || race.mode==='endurance') return '';
        try{ return renderRaceEndHighlightsHtml(computeRaceEndHighlights(race, rl, arr)); }catch{ return ''; }
      })();
      return `
        <div class="muted">${t('dashboard.race_intro')}</div>
        ${raceEndHighlights}
        <div class="hr"></div>
        <table class="table dashBig">
          <thead><tr><th>#</th><th>${t('dashboard.driver')}</th><th class="small">${t('dashboard.laps')}</th><th>${t('dashboard.total_time')}</th><th>${t('dashboard.best')}</th><th>${t('dashboard.mrc_delta')}</th><th>${t('dashboard.average_kmh')}</th><th>${t('dashboard.last')}</th></tr></thead>
          <tbody>${body}</tbody>
        </table>
        ${hint}
      `;
    }

    function viewLabel(v){
      if(v==='auto') return t('dashboard.view_auto');
      if(v==='race') return t('dashboard.view_race');
      if(v==='drivers') return t('dashboard.view_drivers');
      if(v==='live') return t('dashboard.view_live');
      if(v==='teams') return t('dashboard.view_teams');
      return v;
    }

    // header controls
    let viewOptions = [
      {v:'auto', t:t('dashboard.view_auto')},
      {v:'race', t:t('dashboard.view_race')},
      {v:'drivers', t:t('dashboard.view_drivers')},
      {v:'live', t:t('dashboard.view_live')}
    ];
    if(hasTeamishMode){
      // In Team- und Langstreckenrennen ist eine Team-Ansicht sinnvoll
      viewOptions.splice(2, 0, {v:'teams', t:t('dashboard.view_teams')});
    }


    function dashViewBtn(v, label){
      const activeCls = (view===v) ? 'btn btn-primary smallbtn' : 'btn smallbtn';
      return `<button class="${activeCls}" data-dash-view="${esc(v)}">${esc(label)}</button>`;
    }

    const sortOptions = [
      {v:'best', t:t('dashboard.sort_best')},
      {v:'last', t:t('dashboard.sort_last')},
      {v:'name', t:t('dashboard.sort_name')}
    ];

    const title = idleMode ? t('dashboard.free_driving') : ((view==='race') ? ((postRaceResultMode ? t('dashboard.race_result') : t('dashboard.placement'))) : (view==='drivers' ? t('dashboard.drivers') : (view==='teams' ? t('dashboard.teams') : t('dashboard.live_laps'))));

    let content = '';
    if(view==='teams') content = renderTeams();
    else if(view==='race') content = renderRace();
    else if(view==='drivers') content = renderDrivers();
    else content = renderLive();

    // Dashboard intentionally has no podium block.
    if(state.ui.podiumRaceId){
      const pr = rd?.races?.find(r=>r.id===state.ui.podiumRaceId) || null;
      if(!pr || !pr.endedAt){
        state.ui.podiumRaceId = '';
        saveState();
      }
    }

    el.innerHTML = `
      ${showEnduranceStatus ? renderEnduranceStatusHtml() : ''}
      <div class="card">
        <div class="card-h">
          <h2>${esc(title)}</h2>
          <div class="row" style="gap:10px;">
            <div class="row wrap dashViewBtns" style="gap:8px;">
              ${viewOptions.map(o=>dashViewBtn(o.v, o.t)).join('')}
            </div>
            ${(view==='drivers' && !inRace) ? `
              <select id="dashSort" class="pill" title="${esc(t('dashboard.sort_title'))}">
                ${sortOptions.map(o=>`<option value="${o.v}" ${o.v===sortPref?'selected':''}>${esc(t('dashboard.sort_prefix', { label:o.t }))}</option>`).join('')}
              </select>
            ` : ''}
            <span class="pill">${esc(getModeLabel())}</span>
          </div>
        </div>
        <div class="card-b">
          ${content}
        </div>
      </div>
    `;

    el.querySelectorAll('[data-dash-view]').forEach(btn=>{
      btn.onclick = ()=>{
        state.ui.dashboardView = btn.getAttribute('data-dash-view') || 'auto';
        saveState();
        renderDashboard();
      };
    });

    const btnPod = el.querySelector('#btnClosePodium');
    if(btnPod){
      btnPod.onclick = ()=>{
        state.ui.podiumRaceId = '';
        saveState();
        renderDashboard();
      };
    }
    const selSort = el.querySelector('#dashSort');
    if(selSort){
      selSort.onchange = (e)=>{
        state.ui.dashboardSort = e.target.value;
        saveState();
        renderDashboard();
      };
    }
  }

  function renderEinzellaeufe(){
    const el = document.getElementById('pageEinzellaeufe');
    const active = state.modes.activeMode==='single';
    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>${esc(t('single.title'))}</h2><span class="pill">${esc(active ? t('common.active') : t('common.inactive'))}</span></div>
          <div class="card-b">
            <div class="muted">${esc(t('single.hint'))}</div>
            <div class="hr"></div>
            <div class="field">
              <label>${esc(t('single.submode'))}</label>
              <select id="singleSub">
                ${[
                  { value:'Training', label:t('submode.training') },
                  { value:'Qualifying', label:t('submode.qualifying') },
                  { value:'Rennen', label:t('submode.race') }
                ].map(x=>`<option value="${esc(x.value)}" ${state.modes.singleSubmode===x.value?'selected':''}>${esc(x.label)}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>${esc(t('single.finish_after'))}</label>
              <select id="singleFinishMode">
                <option value="none" ${state.modes.single.finishMode==='none'?'selected':''}>${esc(t('single.limit_none'))}</option>
                <option value="time" ${state.modes.single.finishMode==='time'?'selected':''}>${esc(t('single.limit_time'))}</option>
                <option value="laps" ${state.modes.single.finishMode==='laps'?'selected':''}>${esc(t('single.limit_laps'))}</option>
              </select>
            </div>
            <div class="grid2" style="gap:12px;">
              <div class="field" id="singleTimeWrap">
                <label>${esc(t('single.time_minutes'))}</label>
                <input id="singleTimeMin" type="number" min="1" step="1" value="${Math.max(1, Math.round((state.modes.single.timeLimitSec||180)/60))}">
              </div>
              <div class="field" id="singleLapWrap">
                <label>${esc(t('single.laps'))}</label>
                <input id="singleLapCount" type="number" min="1" step="1" value="${Math.max(1, state.modes.single.lapLimit||20)}">
              </div>
            </div>
            <div class="row">
              <button class="btn btn-primary" id="btnActivateSingle">${esc(t('single.activate'))}</button>
            </div>
          </div>
        </div>
        <div class="card"><div class="card-h"><h2>${esc(t('single.info'))}</h2></div><div class="card-b"><div class="muted">${esc(t('single.info_body'))}</div></div></div>
      </div>
    `;
    el.querySelector('#singleSub').onchange=(e)=>{ state.modes.singleSubmode=e.target.value; saveState(); renderAll(); };
    const fm = el.querySelector('#singleFinishMode');
    const timeWrap = el.querySelector('#singleTimeWrap');
    const lapWrap = el.querySelector('#singleLapWrap');
    function syncSingleFinishUI(){
      const mode = state.modes.single.finishMode || 'none';
      if(timeWrap) timeWrap.style.display = (mode==='time') ? '' : 'none';
      if(lapWrap) lapWrap.style.display = (mode==='laps') ? '' : 'none';
    }
    if(fm){
      fm.onchange = (e)=>{ state.modes.single.finishMode = e.target.value; saveState(); syncSingleFinishUI(); };
    }
    const tmin = el.querySelector('#singleTimeMin');
    if(tmin){
      tmin.onchange = (e)=>{ const v = Math.max(1, parseInt(e.target.value||'0',10)||1); state.modes.single.timeLimitSec = v*60; saveState(); };
    }
    const lcnt = el.querySelector('#singleLapCount');
    if(lcnt){
      lcnt.onchange = (e)=>{ const v = Math.max(1, parseInt(e.target.value||'0',10)||1); state.modes.single.lapLimit = v; saveState(); };
    }
    syncSingleFinishUI();

    el.querySelector('#btnActivateSingle').onclick=()=>{
      state.modes.activeMode='single';
      saveState();
      logLine(t('single.log_activated', { submode:state.modes.singleSubmode }));
      toast('Modus', t('single.activated'),'ok');
      renderSessionControl(); renderAll();
    };
  }

  function renderTeamrennen(){
    const el = document.getElementById('pageTeamrennen');
    const active = state.modes.activeMode==='team';
    const driversAll = state.masterData.drivers.slice();
    const q = (state.ui.teamAssignQuery||'').trim().toLowerCase();
    const teams = state.modes.team.teams || [];
    const assigned = new Set(teams.flatMap(t=>t.driverIds||[]));
    const drivers = driversAll
      .filter(d=>!assigned.has(d.id))
      .filter(d=>!q || String(d.name||'').toLowerCase().includes(q));

    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h">
            <h2>${esc(t('team.title'))}</h2>
            <span class="pill">${esc(active ? t('common.active') : t('common.inactive'))}</span>
          </div>
          <div class="card-b">
            <div class="row between">
              <div class="field" style="flex:1">
                <label>${esc(t('team.search_driver'))}</label>
                <input class="input" id="teamAssignQuery" placeholder="${esc(t('common.search_name_placeholder'))}" value="${esc(state.ui.teamAssignQuery||'')}"/>
              </div>
            </div>
            <div class="hr"></div>

            <div class="field">
              <label>${esc(t('team.finish'))}</label>
              <select id="teamFinishMode">
                <option value="time" ${state.modes.team.finishMode==='time'?'selected':''}>${esc(t('single.limit_time'))}</option>
                <option value="laps" ${state.modes.team.finishMode==='laps'?'selected':''}>${esc(t('single.limit_laps'))}</option>
                <option value="none" ${state.modes.team.finishMode==='none'?'selected':''}>${esc(t('team.finish_manual'))}</option>
              </select>
            </div>

            <div class="row" style="gap:10px; flex-wrap:wrap">
              <div class="field" style="flex:1; min-width:180px">
                <label>${esc(t('team.time_limit_min'))}</label>
                <input class="input" id="teamTimeLimitMin" type="number" min="1" step="1" value="${esc(Math.max(1, Math.round((state.modes.team.timeLimitSec||180)/60)))}"/>
              </div>
              <div class="field" style="flex:1; min-width:180px">
                <label>${esc(t('team.lap_limit'))}</label>
                <input class="input" id="teamLapLimit" type="number" min="1" step="1" value="${esc(state.modes.team.lapLimit||20)}"/>
              </div>
              <div class="field" style="flex:2; min-width:260px">
                <label>${esc(t('team.points_scheme'))}</label>
                <input class="input" id="teamPointsScheme" placeholder="${esc(t('team.points_placeholder'))}" value="${esc(state.modes.team.pointsScheme||'10,8,6,5,4,3,2,1')}"/>
                <div class="muted small">${esc(t('team.points_hint'))}</div>
              </div>
            </div>

            <div class="muted small">${esc(t('team.drag_hint'))}</div>
            <div id="teamPool" class="dnd-pool" aria-label="${esc(t('team.search_driver'))}"></div>
            <div class="hr"></div>
            <div class="row">
              <button class="btn" id="btnAddTeam">${esc(t('team.add'))}</button>
              <button class="btn btn-primary" id="btnActivateTeam">${esc(t('team.activate'))}</button>
              <button class="btn" id="btnDeactivateTeam">${esc(t('team.deactivate'))}</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h">
            <h2>${esc(t('common.teams'))}</h2>
            <span class="pill">${teams.length} ${esc(t('common.teams'))}</span>
          </div>
          <div class="card-b">
            <div id="teamBoxes" class="team-boxes"></div>
            <div class="hr"></div>
            <div class="drop-unassigned" id="dropUnassigned">${esc(t('team.drop_remove'))}</div>
          </div>
        </div>
      </div>
    ` + `
      <div class="card" style="margin-top:12px">
        <div class="card-h"><h2>${esc(t('team.points_title'))}</h2></div>
        <div class="card-b">
          ${(()=>{
            const rid = state.session.currentRaceId || '';
            const race = getActiveRaceDay()?.races?.find(r=>r.id===rid && r.mode==='team') || null;
            const laps = race ? getRelevantRaceLaps(race.id, state.session.laps||[]) : [];
            const teamsLive = computeTeamPointsStandings(laps);
            const drvLive = computeDriverStandingsGlobal(laps);
            const ptsScheme = parsePointsScheme(state.modes.team.pointsScheme);
            return `
              <div class="muted">${esc(t('team.points_intro'))}</div>
              <div class="row wrap" style="gap:8px">${ptsScheme.map((p,idx)=>`<span class="badge">P${idx+1}: ${p}</span>`).join('')}</div>
              <table class="table">
                <thead><tr><th>#</th><th>${esc(t('common.team'))}</th><th>${esc(t('team.points'))}</th><th>${esc(t('team.members'))}</th></tr></thead>
                <tbody>
                  ${teamsLive.map((teamRow,idx)=>`<tr><td>${idx+1}</td><td>${esc(teamRow.name)}</td><td><b>${teamRow.points||0}</b></td><td>${esc(teamRow.members||'—')}</td></tr>`).join('') || `<tr><td colspan="4" class="muted">${esc(t('common.no_data'))}</td></tr>`}
                </tbody>
              </table>
              <div class="hr"></div>
              <table class="table">
                <thead><tr><th>#</th><th>${esc(t('team.driver'))}</th><th>${esc(t('common.team'))}</th><th>${esc(t('team.points'))}</th><th>${esc(t('single.laps'))}</th><th>${esc(t('team.time'))}</th></tr></thead>
                <tbody>
                  ${drvLive.map((d,idx)=>{
                    const teamRow = (state.modes.team.teams||[]).find(team=>(team.driverIds||[]).includes(d.id));
                    const pts = ptsScheme[idx] || 0;
                    return `<tr><td>${idx+1}</td><td>${esc(d.name||'—')}</td><td>${esc(teamRow?.name||'—')}</td><td>${pts}</td><td>${d.lapsCount||d.laps||0}</td><td class="mono">${d.totalMs!=null?esc(msToTime(d.totalMs,3)):'—'}</td></tr>`;
                  }).join('') || `<tr><td colspan="6" class="muted">${esc(t('common.no_data'))}</td></tr>`}
                </tbody>
              </table>
            `;
          })()}
        </div>
      </div>
`;

    // pool
    const pool = el.querySelector('#teamPool');
    pool.innerHTML = drivers.length ? drivers.map(d=>renderDriverChip(d,'pool')).join('') : `<div class="muted">${esc(t('common.no_free_drivers'))}</div>`;

    // teams
    const boxes = el.querySelector('#teamBoxes');
    boxes.innerHTML = teams.map((team, idx)=>{
      const members = (team.driverIds||[]).map(id=>state.masterData.drivers.find(d=>d.id===id)).filter(Boolean);
      return `
        <div class="team-box" data-team-id="${esc(team.id)}">
          <div class="team-box-h">
            <input class="input team-name" data-team-name="${esc(team.id)}" value="${esc(team.name||t('team.default_name', { n:idx+1 }))}" />
            <button class="icon-btn" title="${esc(t('team.delete_title'))}" data-del-team="${esc(team.id)}">🗑️</button>
          </div>
          <div class="team-drop" data-drop-team="${esc(team.id)}">
            ${members.length ? members.map(d=>renderDriverChip(d,'team',team.id)).join('') : `<div class="muted small">${esc(t('team.drop_here'))}</div>`}
          </div>
        </div>
      `;
    }).join('');

    // bindings
    el.querySelector('#teamAssignQuery').addEventListener('input', (e)=>{
      state.ui.teamAssignQuery = e.target.value;
      saveState();
      renderTeamrennen();
    });

    el.querySelector('#btnAddTeam').addEventListener('click', ()=>{
      state.modes.team.teams.push({id:uid(), name:t('team.default_name', { n:state.modes.team.teams.length+1 }), driverIds:[]});
      saveState(); renderTeamrennen(); toast('Modus', t('team.added'),'ok');
    });

    el.querySelector('#btnActivateTeam').addEventListener('click', ()=>{
      state.modes.activeMode='team';
      saveState(); renderAll(); toast('Modus', t('team.activated'),'ok');
    });
    el.querySelector('#btnDeactivateTeam').addEventListener('click', ()=>{
      if(state.modes.activeMode==='team') state.modes.activeMode='none';
      saveState(); renderAll(); toast('Modus', t('team.deactivated'),'ok');
    });

    // team name edits + delete
    boxes.querySelectorAll('input[data-team-name]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const id = inp.getAttribute('data-team-name');
        const team = state.modes.team.teams.find(x=>x.id===id);
        if(team){ team.name = inp.value.trim()||team.name; saveState(); toast('Modus', t('team.name_saved'),'ok'); renderTeamrennen(); }
      });
    });
    boxes.querySelectorAll('[data-del-team]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-del-team');
        const team = state.modes.team.teams.find(x=>x.id===id);
        if(!team) return;
        if((team.driverIds||[]).length){ toast('Modus', t('team.not_empty'),'warn'); return; }
        state.modes.team.teams = state.modes.team.teams.filter(x=>x.id!==id);
        saveState(); renderTeamrennen(); toast('Modus', t('team.deleted'),'ok');
      });
    });

    // Drag & drop
    el.querySelectorAll('.driver-chip[draggable="true"]').forEach(ch=>{
      ch.addEventListener('dragstart', (ev)=>{
        ev.dataTransfer.setData('text/plain', ch.getAttribute('data-driver-id'));
        ev.dataTransfer.effectAllowed='move';
      });
    });

    boxes.querySelectorAll('[data-drop-team]').forEach(zone=>{
      zone.addEventListener('dragover', (ev)=>{ ev.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', ()=>zone.classList.remove('dragover'));
      zone.addEventListener('drop', (ev)=>{
        ev.preventDefault(); zone.classList.remove('dragover');
        const driverId = ev.dataTransfer.getData('text/plain');
        const teamId = zone.getAttribute('data-drop-team');
        assignDriverToTeam('team', driverId, teamId);
        renderTeamrennen();
      });
    });

    const un = el.querySelector('#dropUnassigned');
    un.addEventListener('dragover', (ev)=>{ ev.preventDefault(); un.classList.add('dragover'); });
    un.addEventListener('dragleave', ()=>un.classList.remove('dragover'));
    un.addEventListener('drop', (ev)=>{
      ev.preventDefault(); un.classList.remove('dragover');
      const driverId = ev.dataTransfer.getData('text/plain');
      unassignDriverFromTeams('team', driverId);
      renderTeamrennen();
    });

    // remove buttons on chips
    boxes.querySelectorAll('[data-remove-from-team]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const driverId = btn.getAttribute('data-remove-from-team');
        unassignDriverFromTeams('team', driverId);
        renderTeamrennen();
      });
    });
  }

  function renderDauerschleife(){
    const el = document.getElementById('pageDauerschleife');
    const active = state.modes.activeMode==='loop';
    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>Dauerschleife</h2><span class="pill">${active?'AKTIV':'inaktiv'}</span></div>
          <div class="card-b">
            <div class="muted"><b>Automatisch</b>: Training → Rennen → Training → … (Start/Stop links).</div>
            <div class="hr"></div>

            <div class="field">
              <label>Training (Minuten)</label>
              <input class="input" id="loopTrainMin" type="number" min="0" step="0.5" value="${esc(state.modes.loop.trainingMin)}"/>
            </div>
            <div class="field">
              <label>Rennen (Minuten)</label>
              <input class="input" id="loopRaceMin" type="number" min="0.1" step="0.5" value="${esc(state.modes.loop.raceMin)}"/>
            </div>

            <div class="row">
              <button class="btn btn-primary" id="btnActivateLoop">Aktiv setzen</button>
              <button class="btn" id="btnSaveLoop">Speichern</button>
            </div>
            <div class="field">
              <label>Aufstellphase (Minuten)</label>
              <input class="input" id="loopSetupMin" type="number" min="0" step="0.5" value="${esc(state.modes.loop.setupMin)}"/>
            </div>
            <div class="field">
              <label>Podium (Minuten)</label>
              <input class="input" id="loopPodiumMin" type="number" min="0" step="0.5" value="${esc(state.modes.loop.podiumMin)}"/>
            </div>


            <div class="hr"></div>
            <div class="muted">Aktuelle Phase: <b>${esc(state.loopRuntime.phase || '—')}</b></div>
          </div>
        </div>
        <div class="card"><div class="card-h"><h2>Info</h2></div><div class="card-b"><div class="muted">Pause friert den Umschalt-Timer ein.</div></div></div>
      </div>
    `;

    // Auto-save loop minute settings on change (so values are always applied)
    function clampNum(v, minV, defV){
      const n = parseFloat(v);
      if(!Number.isFinite(n)) return defV;
      return Math.max(minV, n);
    }
    const iTrain = el.querySelector('#loopTrainMin');
    const iSetup = el.querySelector('#loopSetupMin');
    const iRace = el.querySelector('#loopRaceMin');
    const iPod  = el.querySelector('#loopPodiumMin');
    const saveLoop = ()=>{
      state.modes.loop.trainingMin = clampNum(iTrain?.value, 0, state.modes.loop.trainingMin||0);
      state.modes.loop.setupMin    = clampNum(iSetup?.value, 0, state.modes.loop.setupMin||0);
      state.modes.loop.raceMin     = clampNum(iRace?.value, 0.01, state.modes.loop.raceMin||0.01);
      state.modes.loop.podiumMin   = clampNum(iPod?.value, 0, state.modes.loop.podiumMin||0);
      saveState();
    };
    [iTrain,iSetup,iRace,iPod].forEach(inp=>{ if(inp) inp.onchange = saveLoop; if(inp) inp.oninput = saveLoop; });
    el.querySelector('#btnSaveLoop').onclick=()=>{
      Math.round((state.modes.loop.trainingMin||0)*60)=Math.max(0, parseInt(el.querySelector('#loopTrain').value,10)||0);
      Math.round((state.modes.loop.raceMin||0)*60)=Math.max(0, parseInt(el.querySelector('#loopRace').value,10)||0);
      saveState();
      toast('Dauerschleife','Gespeichert.','ok');
      logLine('Loop Settings gespeichert');
      renderAll();
    };
    el.querySelector('#btnActivateLoop').onclick=()=>{
      // Save loop phase durations (minutes)
      const t = parseFloat(document.querySelector('#loopTrainMin')?.value||'0');
      const s = parseFloat(document.querySelector('#loopSetupMin')?.value||'0');
      const r = parseFloat(document.querySelector('#loopRaceMin')?.value||'0');
      const p = parseFloat(document.querySelector('#loopPodiumMin')?.value||'0');
      state.modes.loop.trainingMin = Number.isFinite(t) ? Math.max(0,t) : 0;
      state.modes.loop.setupMin = Number.isFinite(s) ? Math.max(0,s) : 0;
      state.modes.loop.raceMin = Number.isFinite(r) ? Math.max(0.01,r) : 0.01;
      state.modes.loop.podiumMin = Number.isFinite(p) ? Math.max(0,p) : 0;

      state.modes.activeMode='loop';
      saveState();
      toast('Modus','Dauerschleife aktiv.','ok');
      logLine('Modus aktiv: Dauerschleife');
      renderSessionControl(); renderAll();
    };
  }

  function renderLangstrecke(){
    const el = document.getElementById('pageLangstrecke');
    const active = state.modes.activeMode==='endurance';
    const driversAll = state.masterData.drivers.slice();
    const q = (state.ui.endAssignQuery||'').trim().toLowerCase();
    if(!Array.isArray(state.modes.endurance.teams)) state.modes.endurance.teams=[];
    const teams = state.modes.endurance.teams;
    const assigned = new Set(teams.flatMap(t=>t.driverIds||[]));
    const drivers = driversAll
      .filter(d=>!assigned.has(d.id))
      .filter(d=>!q || String(d.name||'').toLowerCase().includes(q));

    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>${esc(t('endurance.title'))}</h2><span class="pill">${esc(active ? t('common.active') : t('common.inactive'))}</span></div>
          <div class="card-b">
            <div class="field">
              <label>${esc(t('endurance.duration_min'))}</label>
              <input class="input" id="endDur" type="number" min="1" step="1" value="${esc(state.modes.endurance.durationMin)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.min_stint'))}</label>
              <input class="input" id="endMinStintLaps" type="number" min="0" step="1" value="${esc(state.modes.endurance.minStintLaps||0)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.max_stint'))}</label>
              <input class="input" id="endMaxStintLaps" type="number" min="0" step="1" value="${esc(state.modes.endurance.maxStintLaps||0)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.penalty_seconds'))}</label>
              <input class="input" id="endPenaltySeconds" type="number" min="0" step="1" value="${esc(state.modes.endurance.penaltySecondsPerViolation||0)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.penalty_threshold'))}</label>
              <input class="input" id="endPenaltyLapThresholdSeconds" type="number" min="0" step="1" value="${esc(state.modes.endurance.penaltyLapThresholdSeconds||0)}"/>
            </div>
            <div class="field">
              <label>${esc(t('endurance.penalty_laps'))}</label>
              <input class="input" id="endPenaltyLapsPerThreshold" type="number" min="0" step="1" value="${esc(state.modes.endurance.penaltyLapsPerThreshold||0)}"/>
            </div>
            <div class="muted small">${esc(t('endurance.intro'))}</div>

            <div class="hr"></div>
            <div class="field">
              <label>${esc(t('endurance.search_driver'))}</label>
              <input class="input" id="endAssignQuery" placeholder="${esc(t('common.search_name_placeholder'))}" value="${esc(state.ui.endAssignQuery||'')}"/>
            </div>
            <div class="muted small">${esc(t('endurance.drag_hint'))}</div>
            <div id="endPool" class="dnd-pool"></div>

            <div class="hr"></div>
            <div class="row">
              <button class="btn" id="btnAddEndTeam">${esc(t('endurance.add'))}</button>
              <button class="btn btn-primary" id="btnActivateEnd">${esc(t('endurance.activate'))}</button>
              <button class="btn" id="btnDeactivateEnd">${esc(t('endurance.deactivate'))}</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h2>${esc(t('common.teams'))}</h2><span class="pill">${teams.length} ${esc(t('common.teams'))}</span></div>
          <div class="card-b">
            <div id="endTeamBoxes" class="team-boxes"></div>
            <div class="hr"></div>
            <div class="drop-unassigned" id="endDropUnassigned">${esc(t('endurance.drop_remove'))}</div>
          </div>
        </div>
      <div class="muted small" style="margin-top:12px">${esc(t('endurance.note_status'))}</div>
      </div>
    `;

    // bindings for duration/laps
    const saveEnduranceSettings = ()=>{
      const durNode = document.getElementById('endDur');
      const minNode = document.getElementById('endMinStintLaps');
      const maxNode = document.getElementById('endMaxStintLaps');
      const penaltyNode = document.getElementById('endPenaltySeconds');
      const thresholdNode = document.getElementById('endPenaltyLapThresholdSeconds');
      const lapsNode = document.getElementById('endPenaltyLapsPerThreshold');
      state.modes.endurance.durationMin = clampInt(Number(durNode?.value||0), 1, 24*60);
      state.modes.endurance.minStintLaps = clampInt(Number(minNode?.value||0), 0, 99999);
      state.modes.endurance.maxStintLaps = clampInt(Number(maxNode?.value||0), 0, 99999);
      state.modes.endurance.penaltySecondsPerViolation = clampInt(Number(penaltyNode?.value||0), 0, 99999);
      state.modes.endurance.penaltyLapThresholdSeconds = clampInt(Number(thresholdNode?.value||0), 0, 99999);
      state.modes.endurance.penaltyLapsPerThreshold = clampInt(Number(lapsNode?.value||0), 0, 99999);
      saveState();
      try{ renderSessionControl(); }catch(e){ console.warn('renderSessionControl failed after endurance settings save', e); }
      try{ renderDashboard(); }catch(e){ console.warn('renderDashboard failed after endurance settings save', e); }
    };
    ['#endDur','#endMinStintLaps','#endMaxStintLaps','#endPenaltySeconds','#endPenaltyLapThresholdSeconds','#endPenaltyLapsPerThreshold'].forEach(sel=>{
      const node = el.querySelector(sel);
      if(node) node.addEventListener('input', saveEnduranceSettings);
      if(node) node.addEventListener('change', ()=>{ saveEnduranceSettings(); toast('Modus', t('common.saved'),'ok'); });
    });

    el.querySelector('#endAssignQuery').addEventListener('input', (e)=>{
      state.ui.endAssignQuery = e.target.value;
      saveState();
      renderLangstrecke();
    });

    const pool = el.querySelector('#endPool');
    pool.innerHTML = drivers.length ? drivers.map(d=>renderDriverChip(d,'pool')).join('') : `<div class="muted">${esc(t('common.no_free_drivers'))}</div>`;

    const boxes = el.querySelector('#endTeamBoxes');
    boxes.innerHTML = teams.map((team, idx)=>{
      const members = (team.driverIds||[]).map(id=>state.masterData.drivers.find(d=>d.id===id)).filter(Boolean);
      return `
        <div class="team-box" data-team-id="${esc(team.id)}">
          <div class="team-box-h">
            <input class="input team-name" data-end-team-name="${esc(team.id)}" value="${esc(team.name||t('endurance.default_name', { n:idx+1 }))}" />
            <button class="icon-btn" title="${esc(t('endurance.delete_title'))}" data-end-del-team="${esc(team.id)}">🗑️</button>
          </div>
          <div class="team-drop" data-end-drop-team="${esc(team.id)}">
            ${members.length ? members.map(d=>renderDriverChip(d,'team',team.id)).join('') : `<div class="muted small">${esc(t('endurance.drop_here'))}</div>`}
          </div>
        </div>
      `;
    }).join('');

    el.querySelector('#btnAddEndTeam').addEventListener('click', ()=>{
      state.modes.endurance.teams.push({id:uid(), name:t('endurance.default_name', { n:state.modes.endurance.teams.length+1 }), driverIds:[]});
      saveState(); renderLangstrecke(); toast('Modus', t('endurance.added'),'ok');
    });
    el.querySelector('#btnActivateEnd').addEventListener('click', ()=>{
      try{
        const durNode = document.getElementById('endDur');
        const minNode = document.getElementById('endMinStintLaps');
        const maxNode = document.getElementById('endMaxStintLaps');
        const penaltyNode = document.getElementById('endPenaltySeconds');
        const thresholdNode = document.getElementById('endPenaltyLapThresholdSeconds');
        const lapsNode = document.getElementById('endPenaltyLapsPerThreshold');
        state.modes.endurance.durationMin = clampInt(Number(durNode?.value||0), 1, 24*60);
        state.modes.endurance.minStintLaps = clampInt(Number(minNode?.value||0), 0, 99999);
        state.modes.endurance.maxStintLaps = clampInt(Number(maxNode?.value||0), 0, 99999);
        state.modes.endurance.penaltySecondsPerViolation = clampInt(Number(penaltyNode?.value||0), 0, 99999);
        state.modes.endurance.penaltyLapThresholdSeconds = clampInt(Number(thresholdNode?.value||0), 0, 99999);
        state.modes.endurance.penaltyLapsPerThreshold = clampInt(Number(lapsNode?.value||0), 0, 99999);
        state.modes.activeMode='endurance';
        saveState();
        logLine(t('endurance.log_activated', {
          duration:state.modes.endurance.durationMin,
          minStint:state.modes.endurance.minStintLaps,
          maxStint:state.modes.endurance.maxStintLaps||0,
          penalty:state.modes.endurance.penaltySecondsPerViolation||0,
          threshold:state.modes.endurance.penaltyLapThresholdSeconds||0,
          laps:state.modes.endurance.penaltyLapsPerThreshold||0
        }));
        renderAll();
        toast('Modus', t('endurance.activated'),'ok');
      }catch(e){
        console.error('btnActivateEnd failed', e);
        toast('Modus', t('endurance.activate_failed'),'err');
      }
    });
    el.querySelector('#btnDeactivateEnd').addEventListener('click', ()=>{
      if(state.modes.activeMode==='endurance') state.modes.activeMode='none';
      saveState(); renderAll(); toast('Modus', t('endurance.deactivated'),'ok');
    });

    boxes.querySelectorAll('input[data-end-team-name]').forEach(inp=>{
      inp.addEventListener('change', ()=>{
        const id = inp.getAttribute('data-end-team-name');
        const team = state.modes.endurance.teams.find(x=>x.id===id);
        if(team){ team.name = inp.value.trim()||team.name; saveState(); toast('Modus', t('endurance.name_saved'),'ok'); renderLangstrecke(); }
      });
    });
    boxes.querySelectorAll('[data-end-del-team]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-end-del-team');
        const team = state.modes.endurance.teams.find(x=>x.id===id);
        if(!team) return;
        if((team.driverIds||[]).length){ toast('Modus', t('endurance.not_empty'),'warn'); return; }
        state.modes.endurance.teams = state.modes.endurance.teams.filter(x=>x.id!==id);
        saveState(); renderLangstrecke(); toast('Modus', t('endurance.deleted'),'ok');
      });
    });

    // Drag setup
    el.querySelectorAll('.driver-chip[draggable="true"]').forEach(ch=>{
      ch.addEventListener('dragstart', (ev)=>{
        ev.dataTransfer.setData('text/plain', ch.getAttribute('data-driver-id'));
        ev.dataTransfer.effectAllowed='move';
      });
    });

    boxes.querySelectorAll('[data-end-drop-team]').forEach(zone=>{
      zone.addEventListener('dragover', (ev)=>{ ev.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', ()=>zone.classList.remove('dragover'));
      zone.addEventListener('drop', (ev)=>{
        ev.preventDefault(); zone.classList.remove('dragover');
        const driverId = ev.dataTransfer.getData('text/plain');
        const teamId = zone.getAttribute('data-end-drop-team');
        assignDriverToTeam('endurance', driverId, teamId);
        renderLangstrecke();
      });
    });

    const un = el.querySelector('#endDropUnassigned');
    un.addEventListener('dragover', (ev)=>{ ev.preventDefault(); un.classList.add('dragover'); });
    un.addEventListener('dragleave', ()=>un.classList.remove('dragover'));
    un.addEventListener('drop', (ev)=>{
      ev.preventDefault(); un.classList.remove('dragover');
      const driverId = ev.dataTransfer.getData('text/plain');
      unassignDriverFromTeams('endurance', driverId);
      renderLangstrecke();
    });

    boxes.querySelectorAll('[data-remove-from-team]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const driverId = btn.getAttribute('data-remove-from-team');
        unassignDriverFromTeams('endurance', driverId);
        renderLangstrecke();
      });
    });
  }

  // -------- Stammdaten (Driver/Car) --------
  function renderStammdaten(){
    const el = document.getElementById('pageStammdaten');
    const driversAll = state.masterData.drivers.slice();
    const carsAll = state.masterData.cars.slice();
    const qDrivers = (state.ui.stammdatenDriverQuery||'').trim().toLowerCase();
    const qCars = (state.ui.stammdatenCarQuery||'').trim().toLowerCase();

    const drivers = qDrivers ? driversAll.filter(d=>String(d.name||'').toLowerCase().includes(qDrivers)) : driversAll;
    const cars = carsAll;
    const unknown = cars.filter(c=>!c.driverId).filter(c=>{
      if(!qCars) return true;
      const name = String(c.name||'').toLowerCase();
      const chip = String(c.chipCode||'').toLowerCase();
      return name.includes(qCars) || chip.includes(qCars);
    });

    const selDriverId = state.ui.stammdatenSelectedDriverId || '';
    const selDriver = selDriverId ? getDriver(selDriverId) : null;
    const selDriverCars = selDriver ? cars.filter(c=>c.driverId===selDriver.id).filter(c=>{
      if(!qCars) return true;
      const name = String(c.name||'').toLowerCase();
      const chip = String(c.chipCode||'').toLowerCase();
      return name.includes(qCars) || chip.includes(qCars);
    }) : [];

    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>Fahrer</h2></div>
          <div class="card-b">
            <div class="row"><button class="btn btn-primary" id="btnAddDriver">+ Fahrer</button></div>
            <div class="hr"></div>
            <div class="field" style="margin:0;">
              <label class="muted small">Suche Fahrer</label>
              <input class="input" id="drvSearch" placeholder="Name…" value="${esc(state.ui.stammdatenDriverQuery||'')}"/>
            </div>
            <div class="hr"></div>
            <div id="driverList"></div>
            <div class="hr"></div>
            <div id="driverEditor"><div class="muted small">Wähle einen Fahrer zum Bearbeiten.</div></div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h2>Autos</h2></div>
          <div class="card-b">
            <div class="row"><button class="btn btn-primary" id="btnAddCar">+ Auto</button></div>
            <div class="hr"></div>
            <div class="field" style="margin:0;">
              <label class="muted small">Suche Autos</label>
              <input class="input" id="carSearch" placeholder="Name oder Chip…" value="${esc(state.ui.stammdatenCarQuery||'')}"/>
            </div>
            <div class="hr"></div>

            <div class="muted">Unbekannte Fahrzeuge (nicht zugewiesen)</div>
            <div id="unknownCars"></div>

            <div class="hr"></div>
            <div class="muted">${selDriver ? `Autos von <b>${esc(selDriver.name)}</b>` : 'Autos eines Fahrers anzeigen: links Fahrer wählen'}</div>
            <div id="carList"></div>

            <div class="hr"></div>
            <div id="carEditor"><div class="muted small">Wähle ein Auto zum Bearbeiten/Zuweisen.</div></div>
          </div>
        </div>
      </div>
    `;

    const driverList = el.querySelector('#driverList');
    driverList.innerHTML = drivers.length ? drivers.map(d=>{
      const nCars = getCarsForDriver(d.id).length;
      const isSel = (selDriver && selDriver.id===d.id);
      return `
        <div class="row wrap" style="justify-content:space-between; margin:8px 0; padding:8px; border-radius:12px; ${isSel?'background:rgba(56,189,248,.10); outline:1px solid rgba(56,189,248,.25);':''}">
          <div>
            <div style="font-weight:850">${esc(d.name)}</div>
            <div class="muted small">${nCars} Autos</div>
          </div>
          <div class="row">
            <button class="btn smallbtn" data-edit-driver="${esc(d.id)}">Auswählen</button>
          </div>
        </div>
      `;
    }).join('') : `<div class="muted">${driversAll.length ? 'Keine Treffer.' : 'Noch keine Fahrer.'}</div>`;

    const unknownEl = el.querySelector('#unknownCars');
    unknownEl.innerHTML = unknown.length ? unknown.map(c=>`
      <div class="row wrap" style="justify-content:space-between; margin:8px 0;">
        <div>
          <div style="font-weight:850">${esc(c.name)}</div>
          <div class="muted small mono">${esc(c.chipCode || '')}</div>
        </div>
        <button class="btn smallbtn" data-edit-car="${esc(c.id)}">Zuweisen</button>
      </div>
    `).join('') : `<div class="muted small">${(carsAll.filter(c=>!c.driverId).length && qCars) ? 'Keine Treffer.' : 'Keine unbekannten Fahrzeuge.'}</div>`;

    const carList = el.querySelector('#carList');
    if(selDriver){
      carList.innerHTML = selDriverCars.length ? selDriverCars.map(c=>`
        <div class="row wrap" style="justify-content:space-between; margin:8px 0;">
          <div>
            <div style="font-weight:850">${esc(c.name)}</div>
            <div class="muted small"><span class="mono">${esc(c.chipCode||'')}</span></div>
          </div>
          <button class="btn smallbtn" data-edit-car="${esc(c.id)}">Bearbeiten</button>
        </div>
      `).join('') : `<div class="muted small">${(carsAll.filter(c=>c.driverId===selDriver.id).length && qCars) ? 'Keine Treffer.' : 'Dieser Fahrer hat noch keine Autos.'}</div>`;
    } else {
      carList.innerHTML = `<div class="muted small">Wähle links einen Fahrer, um seine Autos hier zu sehen.</div>`;
    }
    const driverEditor = el.querySelector('#driverEditor');
    if(selDriver){
      const avatar = getDriverAvatarDataUrl(selDriver.id);
      const ini = initials(selDriver.name);
      driverEditor.innerHTML = `
        <div class="row between">
          <div class="row" style="gap:12px">
            <div class="avatar-lg">${avatar?'<img src="'+avatar+'" alt=""/>' : '<span>'+esc(ini)+'</span>'}</div>
            <div>
              <div class="muted small">Fahrer</div>
              <div style="font-weight:800;font-size:18px">${esc(selDriver.name)}</div>
            </div>
          </div>
          <div class="row">
            <input type="file" id="driverAvatarFile" accept="image/*" style="display:none"/>
            <button class="btn" id="btnDriverAvatar">Bild hochladen</button>
            <button class="btn" id="btnDriverAvatarDel">Entfernen</button>
          </div>
        </div>
        <div class="muted small">Tipp: Wenn iPhone-HEIC nicht geht, Bild über ChatGPT als JPG/WebP speichern.</div>
      `;
      const fileInput = driverEditor.querySelector('#driverAvatarFile');
      driverEditor.querySelector('#btnDriverAvatar').addEventListener('click', ()=>fileInput.click());
      fileInput.addEventListener('change', async ()=>{
        const f = fileInput.files && fileInput.files[0];
        if(f) await setDriverAvatar(selDriver.id, f);
        fileInput.value='';
      });
      driverEditor.querySelector('#btnDriverAvatarDel').addEventListener('click', ()=>removeDriverAvatar(selDriver.id));
    }else{
      driverEditor.innerHTML = `<div class="muted small">Wähle links einen Fahrer, um Bild/Name zu bearbeiten.</div>`;
    }


    // Search bindings
    el.querySelector('#drvSearch').oninput = (e)=>{
      state.ui.stammdatenDriverQuery = e.target.value;
      saveState();
      renderStammdaten();
    };
    el.querySelector('#carSearch').oninput = (e)=>{
      state.ui.stammdatenCarQuery = e.target.value;
      saveState();
      renderStammdaten();
    };

    el.querySelector('#btnAddDriver').onclick=()=>{
      state.masterData.drivers.push({ id:uid('drv'), name:'Neuer Fahrer', photoDataUrl:'' });
      saveState(); toast('Stammdaten','Fahrer angelegt.','ok'); renderAll();
    };
    el.querySelector('#btnAddCar').onclick=()=>{
      state.masterData.cars.push({ id:uid('car'), name:'Neues Auto', chipCode:'', driverId:'' });
      saveState(); toast('Stammdaten','Auto angelegt.','ok'); renderAll();
    };

    el.querySelectorAll('[data-edit-driver]').forEach(btn => btn.onclick=()=>{
      state.ui.stammdatenSelectedDriverId = btn.getAttribute('data-edit-driver') || '';
      saveState();
      renderAll();
    });
    el.querySelectorAll('[data-edit-car]').forEach(btn => btn.onclick=()=> openCarEditor(btn.getAttribute('data-edit-car')) );

    // Re-open editor after re-render
    if(selDriver && getDriver(selDriver.id)){
      openDriverEditor(selDriver.id);
    }
  }

  function openDriverEditor(driverId){
    const d = getDriver(driverId); if(!d) return;
    state.ui.stammdatenSelectedDriverId = d.id;
    saveState();
    const page = document.getElementById('pageStammdaten');
    const host = page.querySelector('#driverEditor');
    host.innerHTML = `
  <div class="card" style="background:rgba(15,23,42,.35);">
    <div class="card-h"><h2>Fahrer bearbeiten</h2></div>
    <div class="card-b">

      <div class="row between" style="align-items:center;">
        <div class="row" style="gap:12px">
          <div class="avatar-lg">${getDriverAvatarDataUrl(d.id)?'<img src="'+getDriverAvatarDataUrl(d.id)+'" alt=""/>' : '<span>'+esc(initials(d.name))+'</span>'}</div>
          <div>
            <div class="muted small">Profilbild</div>
            <div class="muted small">512×512 gespeichert • 1:1</div>
          </div>
        </div>
        <div class="row">
          <input type="file" id="driverAvatarFile2" accept="image/*" style="display:none"/>
          <button class="btn" id="btnDriverAvatar2">Bild hochladen</button>
          <button class="btn" id="btnDriverAvatarDel2">Entfernen</button>
        </div>
      </div>
      <div class="muted small">Tipp: Wenn iPhone-HEIC nicht geht, Bild über ChatGPT als JPG/WebP speichern.</div>

      <div class="hr"></div>

      <div class="field">
        <label>Name</label>
        <input class="input" id="drvName" value="${esc(d.name)}"/>
      </div>
      <div class="field">
        <label>Phonetischer Name (Ansage)</label>
        <input class="input" id="drvPhonetic" placeholder="z.B. 'Tiim' / 'Olli' / 'Schu-macher'" value="${esc(d.phoneticName||'')}"/>
        <div class="row" style="margin-top:8px">
          <button class="btn" id="btnTestDriverPronounce" type="button">Ansage testen</button>
        </div>
        <div class="muted small" style="margin-top:6px">Wird nur für die Sprachausgabe genutzt.</div>
      </div>

      <div class="field">
        <label>Farbe (Dashboard)</label>
        <div class="row" style="gap:10px; align-items:center; flex-wrap:wrap">
          <input class="input" id="drvColor" type="color" value="${esc(d.color||'#2d6cdf')}" style="width:64px; padding:0; height:38px"/>
          <label class="row" style="gap:8px"><input type="checkbox" id="drvColorAutoText" ${d.colorAutoText!==false?'checked':''}/> Textfarbe automatisch</label>
        </div>
      </div>
      <div class="field">
        <label>Fahrersound bei „Nur Bestzeit“</label>
        <select class="input" id="drvLapSoundId">${renderAudioAssetOptionTags(d.lapSoundAssetId||'', '— Standard-Sound verwenden —')}</select>
        <div class="muted small" style="margin-top:6px">Eigener kurzer Sound für diesen Fahrer. Ohne Auswahl greift der Standard-Sound aus Audio.</div>
      </div>

      <div class="row">
        <button class="btn btn-primary" id="drvSave">Speichern</button>
        <button class="btn btn-danger" id="drvDel">Löschen</button>
      </div>
    </div>
  </div>
`;
    
// Avatar bindings (kein Popup – direkt Datei auswählen)
{
  const fi = host.querySelector('#driverAvatarFile2');
  const btnUp = host.querySelector('#btnDriverAvatar2');
  const btnDel = host.querySelector('#btnDriverAvatarDel2');
  if(btnUp && fi){
    btnUp.addEventListener('click', ()=>fi.click());
    fi.addEventListener('change', async ()=>{
      const f = fi.files && fi.files[0];
      if(f) await setDriverAvatar(d.id, f);
      fi.value='';
      openDriverEditor(d.id); // refresh preview
    });
  }
  if(btnDel){
    btnDel.addEventListener('click', ()=>{
      removeDriverAvatar(d.id);
      openDriverEditor(d.id);
    });
  }
}

const btnTestPronounce = host.querySelector('#btnTestDriverPronounce');
if(btnTestPronounce){
  btnTestPronounce.onclick = ()=>{
    const name = (host.querySelector('#drvPhonetic')?.value || host.querySelector('#drvName')?.value || d.name || '').trim();
    if(!name){ toast('Audio','Kein Name für Test vorhanden.','err'); return; }
    queueSpeak(name);
    toast('Audio','Ansage wird abgespielt.','ok');
  };
}

host.querySelector('#drvSave').onclick=()=>{
      const name = host.querySelector('#drvName').value.trim();
      const phon = host.querySelector('#drvPhonetic')?.value?.trim() || '';
      const color = host.querySelector('#drvColor')?.value || '';
      const autoText = !!host.querySelector('#drvColorAutoText')?.checked;
      const lapSoundAssetId = host.querySelector('#drvLapSoundId')?.value || '';

      if(name) d.name = name;
      d.phoneticName = phon;
      d.color = color;
      d.colorAutoText = autoText;
      d.lapSoundAssetId = lapSoundAssetId;

      saveState();
      toast('Fahrer','Gespeichert.','ok');
      renderAll();
    };

    // Live update color without needing a save click
    const col = host.querySelector('#drvColor');
    const auto = host.querySelector('#drvColorAutoText');
    if(col){
      col.oninput = ()=>{
        d.color = col.value || '';
        saveState();
        renderDashboard();
      };
    }
    if(auto){
      auto.onchange = ()=>{
        d.colorAutoText = !!auto.checked;
        saveState();
        renderDashboard();
      };
    }
    host.querySelector('#drvDel').onclick=()=>{
      state.masterData.cars.forEach(c=>{ if(c.driverId===d.id) c.driverId=''; });
      state.masterData.drivers = state.masterData.drivers.filter(x=>x.id!==d.id);
      state.ui.stammdatenSelectedDriverId = '';
      saveState(); toast('Fahrer','Gelöscht. Autos sind jetzt nicht zugewiesen.','warn'); renderAll();
    };
  }

  function openCarEditor(carId){
    const c = getCar(carId); if(!c) return;
    const page = document.getElementById('pageStammdaten');
    const host = page.querySelector('#carEditor');
    const drivers = state.masterData.drivers;
    host.innerHTML = `
      <div class="card" style="background:rgba(15,23,42,.35);">
        <div class="card-h"><h2>Auto bearbeiten / Zuweisen</h2></div>
        <div class="card-b">
          <div class="field">
            <label>Name</label>
            <input class="input" id="carName" value="${esc(c.name)}"/>
          </div>
          <div class="field">
            <label>Chip Code (zwischen den Kommas)</label>
            <input class="input mono" id="carChip" value="${esc(c.chipCode||'')}"/>
          </div>
          <div class="field">
            <label>Fahrer</label>
            <select id="carDriver">
              <option value="">— nicht zugewiesen —</option>
              ${drivers.map(d=>`<option value="${esc(d.id)}" ${c.driverId===d.id?'selected':''}>${esc(d.name)}</option>`).join('')}
            </select>
          </div>

          <div class="row">
            <button class="btn btn-primary" id="carSave">Speichern</button>
            <button class="btn btn-danger" id="carDel">Löschen</button>
          </div>
        </div>
      </div>
    `;
    host.querySelector('#carSave').onclick=()=>{
      const prevDriverId = c.driverId || '';
      c.name = host.querySelector('#carName').value.trim() || c.name;
      c.chipCode = host.querySelector('#carChip').value.trim().toUpperCase();
      c.driverId = host.querySelector('#carDriver').value;

      if(prevDriverId !== (c.driverId || '')){
        const activeRace = state.session.currentRaceId ? (getActiveRaceDay()?.races||[]).find(r=>r.id===state.session.currentRaceId) : null;
        const isLiveEndurance = !!(state.session.state==='RUNNING' && activeRace && activeRace.mode==='endurance');
        state.session.ignoreNextLapByCarId = state.session.ignoreNextLapByCarId || {};
        state.session.lastPassByCarId = state.session.lastPassByCarId || {};
        state.session.lastPassSeenByCarId = state.session.lastPassSeenByCarId || {};
        if(isLiveEndurance){
          delete state.session.ignoreNextLapByCarId[c.id];
          delete state.session.lastPassSeenByCarId[c.id];
          logLine(`Auto neu zugewiesen: ${c.name} → Langstrecke Wechsel ohne Rundeverlust aktiv`);
        }else{
          state.session.ignoreNextLapByCarId[c.id] = true;
          // Start anchor neu setzen, damit keine alte Referenz in die neue Zuordnung reinläuft
          delete state.session.lastPassByCarId[c.id];
          delete state.session.lastPassSeenByCarId[c.id];
          logLine(`Auto neu zugewiesen: ${c.name} → nächste volle Runde wird ignoriert`);
        }
      }

      saveState(); toast('Auto','Gespeichert.','ok'); renderAll();
    };
    host.querySelector('#carDel').onclick=()=>{
      state.masterData.cars = state.masterData.cars.filter(x=>x.id!==c.id);
      saveState(); toast('Auto','Gelöscht.','warn'); renderAll();
    };
  }

  // -------- Strecken --------
  function renderStrecken(){
    const el = document.getElementById('pageStrecken');
    const tracks = state.tracks.tracks;
    const activeId = state.tracks.activeTrackId;
    const active = getActiveTrack();
    const rec = getTrackRecord(active);
    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>Strecken</h2></div>
          <div class="card-b">
            <div class="field">
              <label>Aktive Strecke</label>
              <select id="trackSel">
                ${tracks.map(t=>`<option value="${esc(t.id)}" ${t.id===activeId?'selected':''}>${esc(formatTrackDisplayName(t))}</option>`).join('')}
              </select>
            </div>
            <div class="row">
              <button class="btn btn-primary" id="trackAdd">+ Strecke</button>
              <button class="btn btn-danger" id="trackDel">Strecke löschen</button>
            </div>
            <div class="hr"></div>

            <div class="field">
              <label>Name</label>
              <input class="input" id="trackName" value="${esc(active?.name||'')}"/>
            </div>
            <div class="field">
              <label>Mindestzeit der Strecke (ms)</label>
              <input class="input" id="trackMin" type="number" min="0" step="1" value="${esc(active?.minLapMs||0)}"/>
            </div>

            <div class="hr"></div>

            <div class="field">
              <label>Modus</label>
              <select id="setupMode">
                ${['Simulation','Schnell'].map(x=>`<option ${active?.setup?.mode===x?'selected':''}>${x}</option>`).join('')}
              </select>
            </div>

            <div class="field">
              <label>Reifenabnutzung</label>
              <select id="setupTire">
                ${['Aus','Normal','Realistisch'].map(x=>`<option ${active?.setup?.tireWear===x?'selected':''}>${x}</option>`).join('')}
              </select>
            </div>

            <div class="field">
              <label>Boost</label>
              <select id="setupBoost">
                <option value="false" ${active?.setup?.boost?'' :'selected'}>Nein</option>
                <option value="true" ${active?.setup?.boost?'selected':''}>Ja</option>
              </select>
            </div>

            <div class="field">
              <label>Länge (Meter)</label>
              <input class="input" id="trackLength" type="number" min="0" step="0.01" placeholder="z.B. 12.5" value="${esc(getTrackLengthMeters(active)||0)}"/>
            </div>

            <div class="muted small">Anzeigeformat: Name M:Modus, R:Reifen, B:Ja/Aus, L:123m</div>
            <div class="row"><button class="btn btn-primary" id="trackSave">Speichern</button></div>
          </div>
        </div>

      </div>
    `;
    el.querySelector('#trackSel').onchange=(e)=>{ state.tracks.activeTrackId=e.target.value; saveState(); renderAll(); };
    el.querySelector('#trackAdd').onclick=()=>{
      const id=uid('track');
      state.tracks.tracks.push({ id, name:'Neue Strecke', minLapMs:3000, displayLengthMeters:0, lengthMeters:0, trackLengthMeters:0, setup:{mode:'Schnell', tireWear:'Aus', boost:false}, record:{ms:null,driverName:'',carName:''} });
      state.tracks.activeTrackId=id;
      saveState(); toast('Strecken','Neue Strecke angelegt.','ok'); renderAll();
    };
    el.querySelector('#trackDel').onclick=()=>{
      if(state.tracks.tracks.length<=1){ toast('Strecken','Mindestens 1 Strecke muss bleiben.','warn'); return; }
      const delId=state.tracks.activeTrackId;
      state.tracks.tracks = state.tracks.tracks.filter(t=>t.id!==delId);
      state.tracks.activeTrackId = state.tracks.tracks[0].id;
      saveState(); toast('Strecken','Strecke gelöscht.','ok'); renderAll();
    };
    el.querySelector('#trackSave').onclick=()=>{
      const t=getActiveTrack(); if(!t) return;
      t.name = el.querySelector('#trackName').value.trim() || t.name;
      t.minLapMs = Math.max(0, parseInt(el.querySelector('#trackMin').value,10)||0);
      t.setup.mode = el.querySelector('#setupMode').value;
      t.setup.tireWear = el.querySelector('#setupTire').value;
      t.setup.boost = (el.querySelector('#setupBoost').value==='true');
      t.displayLengthMeters = Math.max(0, parseFloat(el.querySelector('#trackLength').value||0) || 0);
      saveState(); toast('Strecken','Gespeichert.','ok'); logLine('Strecke gespeichert: '+formatTrackDisplayName(t));
      renderAll();
    };
  }

  // -------- Renntag --------
  
  // -------- Ergebnis / Podium (global, für Renntag & Dashboard) --------
  function driverKeyForLapGlobal(l){
    const car = l && l.carId ? getCar(l.carId) : null;
    const did = ((l && (l.driverId || '')) || car?.driverId || '').trim();
    return did || '__unknown__';
  }
  function driverNameByIdGlobal(id){
    if(id==='__unknown__') return 'Unbekannt';
    const d = getDriver(id);
    return d?.name || 'Unbekannt';
  }


  function filterLapsForRaceBounds(laps, race){
    if(!race) return laps || [];
    const startMrc = Number(race.startedAtMrc || 0);
    let endMrc = Number(race.endedAtMrc || 0);
    if(!endMrc || (startMrc && endMrc < startMrc)) endMrc = Number.POSITIVE_INFINITY;

    const tid = race.trackId || '';
    return (laps||[]).filter(l=>{
      if(tid && l.trackId && l.trackId!==tid) return false;
      const ts = Number(l.ts || l.time || 0);
      if(!ts) return true;
      if(ts >= 1000000000000) return false;
      if(startMrc && ts < startMrc) return false;
      if(endMrc!==Number.POSITIVE_INFINITY && ts > endMrc) return false;
      return true;
    });
  }

  function getRaceById(raceId){
    const rd = getActiveRaceDay();
    if(!rd) return null;
    return (rd.races||[]).find(r=>r.id===raceId) || null;
  }

  function raceUsesBestLapRanking(race){
    const submode = String(race?.submode || '').trim().toLowerCase();
    return submode === 'qualifying' || submode === 'training';
  }

  function sortDriverStandingRows(rows, race, opts={}){
    const locale = getUiLocale();
    const bestLapRanking = raceUsesBestLapRanking(race);
    rows.sort((a,b)=>{
      if(bestLapRanking){
        const ab = a.bestMs==null ? 9e15 : a.bestMs;
        const bb = b.bestMs==null ? 9e15 : b.bestMs;
        if(ab!==bb) return ab-bb;
        const al = (b.lapsCount || b.laps || 0) - (a.lapsCount || a.laps || 0);
        if(al) return al;
        const at = a.lastMs==null ? 9e15 : a.lastMs;
        const bt = b.lastMs==null ? 9e15 : b.lastMs;
        if(at!==bt) return at-bt;
        return String(a.name||'').localeCompare(String(b.name||''), locale);
      }
      return compareDriverStandingRows(a,b, opts);
    });
    return rows;
  }

  function getRelevantRaceLaps(raceId, lapsAll){
    const laps = (lapsAll||[]).filter(l=>l.raceId===raceId);
    const race = getRaceById(raceId);
    return filterLapsForRaceBounds(laps, race);
  }


function compareDriverStandingRows(a,b, opts={}){
  if((b.laps||0)!==(a.laps||0)) return (b.laps||0)-(a.laps||0);

  // Bei gleicher Rundenzahl gilt sportlich schlicht:
  // wer die Ziellinie zuerst ein weiteres Mal überquert hat, liegt vorne.
  // Deshalb ist die letzte gültige Zielüberfahrt der wichtigste Tiebreaker –
  // nicht die aufsummierte Gesamtzeit, die durch HTML/MRC-Mix kurzfristig
  // springen kann. Frühere lastTs = weiter vorne.
  const al = Number.isFinite(a.lastTs) ? Number(a.lastTs) : Number.MAX_SAFE_INTEGER;
  const bl = Number.isFinite(b.lastTs) ? Number(b.lastTs) : Number.MAX_SAFE_INTEGER;
  if(al!==bl) return al-bl;

  const at = a.totalMs==null ? 9e15 : a.totalMs;
  const bt = b.totalMs==null ? 9e15 : b.totalMs;
  if(at!==bt) return at-bt;
  const ab = a.bestMs==null ? 9e15 : a.bestMs;
  const bb = b.bestMs==null ? 9e15 : b.bestMs;
  if(ab!==bb) return ab-bb;
  const am = a.lastMs==null ? 9e15 : a.lastMs;
  const bm = b.lastMs==null ? 9e15 : b.lastMs;
  if(am!==bm) return am-bm;
  return String(a.name||'').localeCompare(String(b.name||''),'de');
}

function computeDriverStandingsGlobal(laps){
laps = (laps||[]).filter(l=>l && l.lapMs!=null);
      const raceOnly = laps.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
      if(raceOnly.length) laps = raceOnly;
      const map = new Map();
      const raceIdNow = state.session.currentRaceId || '';
      const raceId = (laps && laps[0] && laps[0].raceId) ? laps[0].raceId : '';
laps.forEach(l=>{
  const id = driverKeyForLapGlobal(l);
  if(!map.has(id)){
    map.set(id,{ id, name: driverNameByIdGlobal(id), laps:0, totalMs:0, bestMs:null, lastMs:null, lastTs:0, finished:false });
  }
  const s = map.get(id);
  s.laps++;
  s.totalMs += (l.lapMs||0);
  if(s.bestMs==null || l.lapMs < s.bestMs) s.bestMs = l.lapMs;
  if(l.ts && l.ts >= (s.lastTs||0)){
    s.lastTs = l.ts;
    s.lastMs = l.lapMs;
  }
});
const arr = Array.from(map.values());
for(const s of arr){
        s.finished = isDriverFinished(s.id);
        if(raceId){
          const rt = getDriverRaceTotalFromStartMs(raceId, s.id, laps);
          if(rt!=null) s.totalMs = rt;
        }
      }
const liveRaceForThisSet = !!(raceId && raceId===state.session.currentRaceId && state.session.state==='RUNNING' && !(state.session.finish&&state.session.finish.pending));
const race = getRaceById(raceId);
sortDriverStandingRows(arr, race, { live: liveRaceForThisSet });
return arr;
}


function parsePointsScheme(raw){
  const vals = String(raw||'10,8,6,5,4,3,2,1')
    .split(/[;,\s]+/)
    .map(x=>parseInt(x,10))
    .filter(x=>Number.isFinite(x) && x>=0);
  return vals.length ? vals : [10,8,6,5,4,3,2,1];
}

function computeTeamPointsStandings(laps){
  const teams = state.modes.team?.teams || [];
  const driverStandings = computeDriverStandingsGlobal(laps);
  const scheme = parsePointsScheme(state.modes.team?.pointsScheme);
  const byDriverPos = new Map();
  driverStandings.forEach((s,idx)=>{
    byDriverPos.set(s.id, { pos: idx+1, points: scheme[idx] || 0, row: s });
  });

  const rows = teams.map(t=>{
    const driverIds = (t.driverIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
    const memberRows = driverIds.map(did=>{
      const p = byDriverPos.get(did);
      return {
        driverId: did,
        name: getDriver(did)?.name || 'Unbekannt',
        pos: p?.pos || null,
        points: p?.points || 0,
        laps: p?.row?.lapsCount || p?.row?.laps || 0,
        totalMs: p?.row?.totalMs ?? null,
        bestMs: p?.row?.bestMs ?? null,
        lastMs: p?.row?.lastMs ?? null
      };
    });
    const points = memberRows.reduce((s,x)=>s+(x.points||0),0);
    const lapCount = memberRows.reduce((s,x)=>s+(x.laps||0),0);
    const totalMs = memberRows.reduce((s,x)=>s+(x.totalMs||0),0);
    const bestMs = memberRows.length ? Math.min(...memberRows.map(x=>x.bestMs==null?Infinity:x.bestMs)) : null;
    const lastMs = memberRows.length ? [...memberRows].sort((a,b)=>(a.lastMs??-1)-(b.lastMs??-1)).slice(-1)[0]?.lastMs ?? null : null;
    return {
      id: t.id,
      name: t.name || 'Team',
      members: memberRows.map(x=>x.name).join(', ') || '—',
      memberRows,
      points,
      lapCount,
      totalMs,
      bestMs: (bestMs===Infinity?null:bestMs),
      lastMs,
      finished: false
    };
  });

  rows.sort((a,b)=> (b.points-a.points) || (b.lapCount-a.lapCount) || ((a.totalMs||9e15)-(b.totalMs||9e15)) || String(a.name).localeCompare(String(b.name),'de'));
  return rows;
}

function computeTeamStandingsGlobal(laps, mode, finish){
  if(mode==='team'){
    const rows = computeTeamPointsStandings(laps);
    // carry finished marker from finish runtime if available
    if(finish && finish.pending && finish.activeCarIds && finish.finishedCarIds){
      const teams = state.modes.team?.teams || [];
      rows.forEach(r=>{
        const t = teams.find(x=>x.id===r.id);
        const driverIds = (t?.driverIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
        const carIds = new Set();
        driverIds.forEach(did=>getCarsByDriver(did).forEach(c=>carIds.add(c.id)));
        const active = (finish.activeCarIds||[]).filter(cid=>carIds.has(cid));
        if(active.length) r.finished = active.every(cid=>!!finish.finishedCarIds[cid]);
      });
    }
    return rows;
  }

  const teams = (mode==='team') ? (state.modes.team?.teams||[]) : (state.modes.endurance?.teams||[]);
  const raceId = (laps && laps[0] && laps[0].raceId) ? laps[0].raceId : '';
  const rows = teams.map(t=>{
    const driverIds = (t.driverIds||[]).map(x=>String(x||'').trim()).filter(Boolean);
    const carIds = new Set();
    driverIds.forEach(did=>{
      getCarsByDriver(did).forEach(c=>carIds.add(c.id));
    });
    const tlaps = laps.filter(l=>{
      if(!l) return false;
      if(l.carId && carIds.has(l.carId)) return true;
      return l.driverId && driverIds.includes(String(l.driverId));
    }).sort((a,b)=>a.ts-b.ts);
    const raceOnly2 = tlaps.filter(l=> (l.kind==='race') || (String(l.phase||'').toLowerCase()==='race') );
    const rel = raceOnly2.length ? raceOnly2 : tlaps;
    const lapCount = rel.length;
    const totalMs = rel.reduce((s,l)=>s+(l.lapMs||0),0);
    const bestMs = lapCount ? Math.min(...rel.map(l=>l.lapMs||Infinity)) : null;
    const lastMs = lapCount ? rel[rel.length-1].lapMs : null;
    const members = driverIds.map(id=>driverNameByIdGlobal(id)).join(', ') || '—';
    let finished = false;
    if(finish && finish.pending && finish.activeCarIds && finish.finishedCarIds){
      const active = (finish.activeCarIds||[]).filter(cid=>carIds.has(cid));
      if(active.length){
        finished = active.every(cid=>!!finish.finishedCarIds[cid]);
      }
    }
    const raceTotal = raceId ? getTeamRaceTotalFromStartMs(raceId, t.id, mode, rel) : totalMs;
    const rule = (mode==='endurance' && raceId) ? getEnduranceRuleStateForTeam(t.id, raceId) : { compliant:true, invalidStintCount:0, statusText:'OK', minStint:0, stints:[], penaltySecondsTotal:0, deductedLaps:0, projectedDeductedLaps:0 };
    return {
      id:t.id,
      name:t.name||'Team',
      members,
      rawLapCount: lapCount,
      rawTotalMs: (raceTotal==null ? totalMs : raceTotal),
      lapCount: mode==='endurance' ? Math.max(0, lapCount - (rule.deductedLaps||0)) : lapCount,
      totalMs: mode==='endurance' ? (((raceTotal==null ? totalMs : raceTotal) || 0) + ((rule.penaltySecondsTotal||0) * 1000)) : (raceTotal==null ? totalMs : raceTotal),
      bestMs,
      lastMs,
      finished,
      compliant: mode==='endurance' ? !!rule.compliant : true,
      invalidStintCount: mode==='endurance' ? (rule.invalidStintCount||0) : 0,
      statusText: mode==='endurance' ? (rule.statusText||'OK') : 'OK',
      penaltySecondsTotal: mode==='endurance' ? (rule.penaltySecondsTotal||0) : 0,
      deductedLaps: mode==='endurance' ? (rule.deductedLaps||0) : 0,
      projectedDeductedLaps: mode==='endurance' ? (rule.projectedDeductedLaps||0) : 0,
      minStintLaps: mode==='endurance' ? (rule.minStint||0) : 0,
      stintCount: mode==='endurance' ? ((rule.stints||[]).length) : 0
    };
  });
  rows.sort((a,b)=>{
    if(b.lapCount!==a.lapCount) return b.lapCount-a.lapCount;
    return (a.totalMs||0)-(b.totalMs||0);
  });
  return rows;
}


function computeRaceEndHighlights(podiumRace, laps, standings){
  const empty = {
    closestGapHtml: '<span class="muted">—</span>',
    comebackHtml: '<span class="muted">—</span>',
    fastestHtml: '<span class="muted">—</span>',
    leadHtml: '<span class="muted">—</span>'
  };
  if(!podiumRace || !Array.isArray(laps) || !laps.length) return empty;
  const mode = podiumRace?.mode || 'single';
  if(mode==='team' || mode==='endurance') return empty;

  const dec = 3;
  const sortedLaps = laps.slice().sort((a,b)=>(a.ts||0)-(b.ts||0));
  const byDriver = new Map();
  for(const l of sortedLaps){
    const did = driverKeyForLapGlobal(l);
    if(did==='__unknown__') continue;
    if(!byDriver.has(did)) byDriver.set(did, []);
    byDriver.get(did).push(l);
  }

  let fastest = null;
  for(const l of sortedLaps){
    if(l.lapMs==null) continue;
    if(!fastest || l.lapMs < fastest.lapMs) fastest = l;
  }

  const firstLapOrder = Array.from(byDriver.entries())
    .map(([did, arr])=>({ did, ts: Number(arr[0]?.ts||0) }))
    .sort((a,b)=>a.ts-b.ts)
    .map((x,i)=>({ did:x.did, startPos:i+1 }));
  const startPosByDriver = new Map(firstLapOrder.map(x=>[x.did, x.startPos]));
  let comeback = null;
  (standings||[]).forEach((row, idx)=>{
    const startPos = startPosByDriver.get(row.id);
    const finalPos = idx + 1;
    if(!startPos) return;
    const gain = startPos - finalPos;
    if(gain > 0 && (!comeback || gain > comeback.gain || (gain===comeback.gain && finalPos < comeback.finalPos))){
      comeback = { id: row.id, name: row.name, gain, startPos, finalPos };
    }
  });

  const progress = new Map();
  const leadCounts = new Map();
  for(const l of sortedLaps){
    const did = driverKeyForLapGlobal(l);
    if(did==='__unknown__') continue;
    if(!progress.has(did)) progress.set(did, { id: did, name: driverNameByIdGlobal(did), laps:0, totalMs:0, bestMs:null, lastMs:null });
    const p = progress.get(did);
    p.laps += 1;
    p.totalMs += Number(l.lapMs||0);
    p.lastMs = Number(l.lapMs||0);
    p.bestMs = (p.bestMs==null) ? Number(l.lapMs||0) : Math.min(p.bestMs, Number(l.lapMs||0));
    const rows = Array.from(progress.values()).slice().sort((a,b)=>{
      if(b.laps!==a.laps) return b.laps-a.laps;
      if((a.totalMs||0)!==(b.totalMs||0)) return (a.totalMs||0)-(b.totalMs||0);
      if((a.bestMs??9e15)!==(b.bestMs??9e15)) return (a.bestMs??9e15)-(b.bestMs??9e15);
      return (a.lastMs??9e15)-(b.lastMs??9e15);
    });
    const leader = rows[0];
    if(leader) leadCounts.set(leader.id, (leadCounts.get(leader.id)||0) + 1);
  }
  let leadLeader = null;
  for(const [did, count] of leadCounts.entries()){
    const name = driverNameByIdGlobal(did);
    if(!leadLeader || count > leadLeader.count) leadLeader = { id: did, name, count };
  }

  let closest = null;
  for(let i=0;i<(standings||[]).length-1;i++){
    const a = standings[i], b = standings[i+1];
    if((a.laps||a.lapsCount||0)===(b.laps||b.lapsCount||0) && a.totalMs!=null && b.totalMs!=null){
      const gapMs = Math.abs(Number(b.totalMs)-Number(a.totalMs));
      if(!closest || gapMs < closest.gapMs){
        closest = { a, b, gapMs, text: `${esc(a.name)} vor ${esc(b.name)} • <span class="mono">${msToTime(gapMs, dec)}</span>` };
      }
    }
  }
  if(!closest && (standings||[]).length>=2){
    const a = standings[0], b = standings[1];
    const lapDiff = Math.max(0, ((a.laps||a.lapsCount||0) - (b.laps||b.lapsCount||0)));
    closest = { a, b, gapMs: null, text: lapDiff>0 ? `${esc(a.name)} vor ${esc(b.name)} • ${lapDiff} Runde${lapDiff===1?'':'n'}` : `${esc(a.name)} vor ${esc(b.name)}` };
  }

  return {
    closestGapHtml: closest ? closest.text : '<span class="muted">—</span>',
    comebackHtml: comeback ? `${esc(comeback.name)} • +${comeback.gain} Plätze` : '<span class="muted">—</span>',
    fastestHtml: fastest ? `${esc(driverNameByIdGlobal(driverKeyForLapGlobal(fastest)))} • <span class="mono">${msToTime(fastest.lapMs, dec)}</span>` : '<span class="muted">—</span>',
    leadHtml: leadLeader ? `${esc(leadLeader.name)} • ${leadLeader.count} Führungsrunde${leadLeader.count===1?'':'n'}` : '<span class="muted">—</span>'
  };
}

function renderRaceEndHighlightsHtml(highlights){
  const h = highlights || {
    closestGapHtml: '<span class="muted">—</span>',
    comebackHtml: '<span class="muted">—</span>',
    fastestHtml: '<span class="muted">—</span>',
    leadHtml: '<span class="muted">—</span>'
  };
  const item = (label, value) => `<div class="card rehCard"><div class="card-b rehCardB"><span class="muted small rehLabel">${label}</span><span class="rehValue">${value}</span></div></div>`;
  return `
    <div class="raceEndHighlights rehInline" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px; margin:12px 0 14px; align-items:stretch;">
      ${item('Knappster Abstand', h.closestGapHtml)}
      ${item('Größte Aufholjagd', h.comebackHtml)}
      ${item('Schnellste Runde', h.fastestHtml)}
      ${item('Meiste Führungsrunden', h.leadHtml)}
    </div>`;
}

function renderPodiumSectionGlobal(podiumRace){
const mode = podiumRace?.mode || 'single';
const laps = state.session.laps.filter(l=>l.raceId===podiumRace.id);
const dec = 3;
// Finish-window status (used to show 🏁 when a driver/team has completed)
const finish = (state.session.finish && state.session.finish.pending) ? state.session.finish : null;

const finishedCarIds = new Set();
const finishedDriverIds = new Set();
if(finish && finish.finishedCarIds){
  for(const carId of Object.keys(finish.finishedCarIds)){
    finishedCarIds.add(carId);
    const c = getCar(carId);
    const did = (c?.driverId||'').trim();
    if(did) finishedDriverIds.add(did);
  }
}
let standings = [];
let isTeams = (mode==='team' || mode==='endurance');
if(isTeams){
  standings = computeTeamStandingsGlobal(laps, mode, finish);
} else {
  standings = computeDriverStandingsGlobal(laps);
}

const top = standings.slice(0,3).map(x=> isTeams ? ({...x, isTeam:true}) : x);
const rest = standings.slice(3).map(x=> isTeams ? ({...x, isTeam:true}) : x);

function box(pos, data){
  if(!data){
    return `<div class="podiumStep p${pos}">
      <div class="podiumPos">${pos}</div>
      <div class="podiumName muted">—</div>
    </div>`;
  }
  if(isTeams){
    return `<div class="podiumStep p${pos}">
      <div class="podiumPos">${pos}</div>
      <div class="podiumProfile">
        ${(()=>{const nm=(data.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return `<div class=\"podiumThumb podiumThumbPlaceholder\"><span>${esc(ini||'?')}</span></div>`;})()}
        <div class="podiumInfoCol">
          <div class="podiumName"><span class="nm">${esc(data.name)}</span>${data.finished?'<span class="finishFlag">🏁</span>':''}</div>
          <div class="podiumSub small muted">${esc(data.members)}</div>
          ${(mode==='endurance' && data.compliant===false) ? `<div class="podiumSub small" style="color:#ff8f8f">${esc(data.statusText||'Regelverstoss')}</div>` : ''}
          <div class="podiumStats small">
            ${(mode==='team')?`<div><span>Punkte</span><b>${data.points||0}</b></div>`:''}
            <div><span>Runden</span><b>${data.lapCount||0}</b></div>
            <div><span>Zeit</span><b class="mono">${data.totalMs?msToTime(data.totalMs, dec):'—'}</b></div>
          </div>
        </div>
      </div>
    </div>`;
  } else {
    return `<div class="podiumStep p${pos}">
      <div class="podiumPos">${pos}</div>
      <div class="podiumProfile">
        ${(()=>{const url=getDriverAvatarDataUrl(data.id);const nm=(data.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"podiumThumb\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"podiumThumb podiumThumbPlaceholder\"><span>${esc(ini||'?')}</span></div>`;})()}
        <div class="podiumInfoCol">
          <div class="podiumName"><span class="nm">${esc(data.name)}</span>${data.finished?'<span class="finishFlag">🏁</span>':''}</div>
          <div class="podiumStats small">
            <div><span>Runden</span><b>${data.laps}</b></div>
            <div><span>Zeit</span><b class="mono">${data.totalMs?msToTime(data.totalMs, dec):'—'}</b></div>
            <div><span>Best</span><b class="mono">${data.bestMs!=null?msToTime(data.bestMs, dec):'—'}</b></div>
          </div>
        </div>
      </div>
    </div>`;
  }
}

const __podiumConfettiHtml = (typeof buildPodiumConfettiHtml === "function") ? buildPodiumConfettiHtml() : '<div class="podiumConfetti" aria-hidden="true"></div>';
const podiumHtml = `
  <div class="card podiumCard">
    ${__podiumConfettiHtml}
    <div class="row" style="align-items:center; justify-content:space-between; gap:12px;">
      <div>
        <div class="title">🏁 Siegerpodest</div>
        <div class="muted small">${esc(podiumRace.name||'Rennen')} • beendet ${new Date(podiumRace.endedAt).toLocaleString('de-DE')}</div>
      </div>
      <button class="btn" id="btnClosePodium">Schließen</button>
    </div>

    <div class="podiumWrap">
      <div class="podiumCol second">${box(2, top[1])}</div>
      <div class="podiumCol first">${box(1, top[0])}</div>
      <div class="podiumCol third">${box(3, top[2])}</div>
    </div>

    <div class="hr"></div>

    ${isTeams ? `
      <div class="muted">Restliche Plätze</div>
      <table class="table">
        <thead><tr><th>#</th><th>Team</th><th>Runden</th><th>Gesamtzeit</th><th>Best</th><th>Letzte</th></tr></thead>
        <tbody>
          ${rest.map((t,i)=>`<tr>
            <td class="mono">${i+4}</td>
            <td><b>${esc(t.name)}</b><div class="muted tiny">${esc(t.members)}</div>${(mode==='endurance' && t.compliant===false)?`<div class="tiny" style="color:#ff8f8f">${esc(t.statusText||'Regelverstoss')}</div>`:''}</td>
            <td class="mono">${t.lapCount}</td>
            <td class="mono">${t.totalMs?msToTime(t.totalMs, dec):'—'}</td>
            <td class="mono">${t.bestMs!=null && isFinite(t.bestMs)?msToTime(t.bestMs, dec):'—'}</td>
            <td class="mono">${t.lastMs!=null && isFinite(t.lastMs)?msToTime(t.lastMs, dec):'—'}</td>
          </tr>`).join('') || `<tr><td colspan="6" class="muted">—</td></tr>`}
        </tbody>
      </table>
    ` : `
      <div class="muted">Restliche Plätze</div>
      <table class="table">
        <thead><tr><th>#</th><th>Fahrer</th><th>Runden</th><th>Gesamtzeit</th><th>Best</th><th>Letzte</th></tr></thead>
        <tbody>
          ${rest.map((s,i)=>`<tr>
            <td class="mono">${i+4}</td>
            <td><div class="nameCell">${(()=>{const url=getDriverAvatarDataUrl(s.id);const nm=(s.name||'');const ini=(nm.trim().split(/\s+/).slice(0,2).map(x=>x[0]||'').join('').toUpperCase());return url?`<img class=\"avatar\" src=\"${esc(url)}\" alt=\"\"/>`:`<div class=\"avatar fallback\">${esc(ini||'?')}</div>`;})()}<span class="nm">${esc(s.name)}</span>${s.finished?'<span class="finishFlag">🏁</span>':''}</div></td>
            <td class="mono">${s.laps}</td>
            <td class="mono">${s.totalMs?msToTime(s.totalMs, dec):'—'}</td>
            <td class="mono">${s.bestMs!=null?msToTime(s.bestMs, dec):'—'}</td>
            <td class="mono">${s.lastMs!=null?msToTime(s.lastMs, dec):'—'}</td>
          </tr>`).join('') || `<tr><td colspan="6" class="muted">—</td></tr>`}
        </tbody>
      </table>
    `}
  </div>
`;

return podiumHtml;
}


  function getRaceDaysForSeason(seasonId){
    return (state.raceDay?.raceDays||[]).filter(rd=>rd.seasonId===seasonId);
  }

  function getRacesForRaceDay(rd){
    return (rd?.races||[]).slice();
  }

  function getRacesForSeason(seasonId){
    return getRaceDaysForSeason(seasonId).flatMap(rd => (rd.races||[]).map(r=>({ ...r, __raceDayId: rd.id, __raceDayName: rd.name })));
  }

  function getRaceTrackName(race){
    const t = state.tracks.tracks.find(x=>x.id===race?.trackId);
    return formatTrackDisplayName(t);
  }

  function getAverageValidLapMsForDriver(driverId, laps){
    const vals = (laps||[]).filter(l=>{
      const did = String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim();
      if(did !== driverId) return false;
      if(l.lapMs==null) return false;
      const track = state.tracks.tracks.find(t=>t.id===l.trackId);
      const maxMs = (track?.minLapMs || 0) * 3;
      if(maxMs > 0 && l.lapMs > maxMs) return false;
      return true;
    }).map(l=>l.lapMs);
    if(!vals.length) return null;
    return vals.reduce((a,b)=>a+b,0) / vals.length;
  }

  function getBestTimesByTrackForDriver(driverId, laps){
    const by = {};
    for(const l of (laps||[])){
      const did = String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim();
      if(did !== driverId) continue;
      if(l.lapMs==null) continue;
      const tid = l.trackId || '';
      if(!tid) continue;
      if(by[tid]==null || l.lapMs < by[tid]) by[tid] = l.lapMs;
    }
    return by;
  }

  function getDriverAggregateStatsForRaces(races){
    const allDrivers = (state.masterData?.drivers||[]).slice();
    const allLaps = state.session.laps || [];
    const out = allDrivers.map(d=>({
      driver:d,
      races:0,
      p1:0,
      p2:0,
      p3:0,
      podiums:0,
      fastestLapCount:0,
      avgMs:null,
      avgPos:null,
      posStdDev:null,
      consistencyScore:null,
      bestByTrack:{},
      positions:[]
    }));

    const byId = Object.fromEntries(out.map(x=>[x.driver.id, x]));
    const raceIds = new Set((races||[]).map(r=>r.id));

    for(const race of (races||[])){
      const laps = getRelevantRaceLaps(race.id, allLaps);
      const standings = computeDriverStandingsGlobal(laps);
      standings.forEach((s, idx)=>{
        const row = byId[s.id];
        if(!row) return;
        const pos = idx + 1;
        row.races += 1;
        row.positions.push(pos);
        if(idx===0) row.p1 += 1;
        if(idx===1) row.p2 += 1;
        if(idx===2) row.p3 += 1;
      });

      const fastestByDriver = new Map();
      for(const lap of laps){
        const did = String(lap?.driverId || (lap?.carId ? (getCar(lap.carId)?.driverId||'') : '') || '').trim();
        if(!did) continue;
        const ms = Number(lap?.lapMs||0);
        if(!(ms>0)) continue;
        const prev = fastestByDriver.get(did);
        if(prev==null || ms < prev) fastestByDriver.set(did, ms);
      }
      let fastestDriverId = '';
      let fastestMs = Infinity;
      for(const [did, ms] of fastestByDriver.entries()){
        if(ms < fastestMs){ fastestMs = ms; fastestDriverId = did; }
      }
      if(fastestDriverId && byId[fastestDriverId]) byId[fastestDriverId].fastestLapCount += 1;
    }

    const lapsSubset = allLaps.filter(l=>raceIds.has(l.raceId));
    for(const row of out){
      row.avgMs = getAverageValidLapMsForDriver(row.driver.id, lapsSubset);
      row.bestByTrack = getBestTimesByTrackForDriver(row.driver.id, lapsSubset);
      row.podiums = (row.p1||0) + (row.p2||0) + (row.p3||0);
      if(row.positions.length){
        const avgPos = row.positions.reduce((a,b)=>a+b,0) / row.positions.length;
        row.avgPos = avgPos;
        const variance = row.positions.reduce((a,p)=>a + Math.pow(p-avgPos,2),0) / row.positions.length;
        row.posStdDev = Math.sqrt(variance);
        row.consistencyScore = (avgPos * 1000) + (row.posStdDev * 100) - (row.p1 * 10) - row.fastestLapCount;
      }
    }

    out.sort((a,b)=>(b.p1-a.p1)||(b.podiums-a.podiums)||((a.avgPos??9e15)-(b.avgPos??9e15))||((a.avgMs??9e15)-(b.avgMs??9e15))||((a.driver.name||'').localeCompare(b.driver.name||'','de')));
    return out;
  }

  function renderBestByTrackCell(bestByTrack){
    const entries = Object.entries(bestByTrack||{});
    if(!entries.length) return '<span class="muted">—</span>';
    entries.sort((a,b)=>{
      const ta = state.tracks.tracks.find(t=>t.id===a[0])?.name || a[0];
      const tb = state.tracks.tracks.find(t=>t.id===b[0])?.name || b[0];
      return ta.localeCompare(tb,'de');
    });
    return entries.map(([tid,ms])=>{
      const nm = state.tracks.tracks.find(t=>t.id===tid)?.name || tid;
      return `<div><b>${esc(formatTrackDisplayName(state.tracks.tracks.find(t=>t.id===tid) || {id:tid,name:nm,setup:{}}))}</b>: <span class="mono">${esc(msToTime(ms,3))}</span></div>`;
    }).join('');
  }

  function renderSessionDriverColumns(race){
    if(!race) return '<div class="muted">Keine Session gewählt.</div>';
    const laps = getRelevantRaceLaps(race.id, state.session.laps||[]).slice().sort((a,b)=>a.ts-b.ts);
    const driverIds = Array.from(new Set(laps.map(l=>String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim()).filter(Boolean)));
    const drivers = driverIds.map(id=>getDriver(id)).filter(Boolean);
    if(!drivers.length) return '<div class="muted">Keine Fahrer in dieser Session.</div>';

    const selectedId = state.ui.analysisSessionDriverId || drivers[0]?.id || '';
    const driver = drivers.find(d=>d.id===selectedId) || drivers[0] || null;
    const dlaps = driver ? laps.filter(l=>String(l.driverId || (l.carId ? (getCar(l.carId)?.driverId||'') : '') || '').trim()===driver.id) : [];
    const best = dlaps.length ? Math.min(...dlaps.map(l=>l.lapMs||9e15)) : null;

    return `
      <div class="field">
        <label>Fahrer</label>
        <select id="analysisSessionDriverSel">
          ${drivers.map(d=>`<option value="${esc(d.id)}" ${d.id===driver?.id?'selected':''}>${esc(d.name)}</option>`).join('')}
        </select>
      </div>
      ${driver ? `
        <div class="card" style="margin-top:12px">
          <div class="card-h"><h2>${esc(driver.name)}</h2></div>
          <div class="card-b">
            <div class="row wrap" style="gap:8px">
              <span class="badge">Runden: ${dlaps.length}</span>
              <span class="badge">Best: ${best!=null ? esc(msToTime(best,3)) : '—'}</span>
            </div>
            <div class="hr"></div>
            <table class="table">
              <thead><tr><th>#</th><th>Zeit</th><th>Phase</th><th class="small">Uhrzeit</th><th></th></tr></thead>
              <tbody>
                ${dlaps.map((l,idx)=>`
                  <tr>
                    <td>${idx+1}</td>
                    <td class="mono">${esc(msToTime(l.lapMs,3))}</td>
                    <td>${esc(l.phase||'')}</td>
                    <td class="small">${esc(new Date(l.ts).toLocaleTimeString('de-DE',{hour12:false}))}</td>
                    <td style="text-align:right"><button class="btn" style="padding:6px 10px" data-del-lap-analysis="${esc(l.id)}">🗑</button></td>
                  </tr>
                `).join('') || `<tr><td colspan="5" class="muted">Keine Runden.</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      ` : '<div class="muted">Kein Fahrer gewählt.</div>'}
    `;
  }

function renderRenntagAuswertung(){
    const el = document.getElementById('pageRenntagAuswertung');
    const rd = getActiveRaceDay();
    if(!rd){ el.innerHTML=`<div class="card"><div class="card-b">${esc(t('renntag.none'))}</div></div>`; return; }

    const races = (rd.races||[]).slice().sort((a,b)=>(b.startedAt||0)-(a.startedAt||0));
    const stats = getDriverAggregateStatsForRaces(races).filter(x=>x.races>0);
    const selectedRaceId = state.ui.analysisRaceId || (races[0]?.id || '');
    if(selectedRaceId !== (state.ui.analysisRaceId||'')){ state.ui.analysisRaceId = selectedRaceId; saveState(); }
    const race = races.find(r=>r.id===selectedRaceId) || null;
    const winsLeader = stats.slice().sort((a,b)=>(b.p1-a.p1)||((a.avgPos??9e15)-(b.avgPos??9e15))||((a.avgMs??9e15)-(b.avgMs??9e15)))[0] || null;
    const podiumLeader = stats.slice().sort((a,b)=>(b.podiums-a.podiums)||(b.p1-a.p1)||((a.avgPos??9e15)-(b.avgPos??9e15)))[0] || null;
    const fastestLeader = stats.slice().sort((a,b)=>(b.fastestLapCount-a.fastestLapCount)||((a.avgMs??9e15)-(b.avgMs??9e15)))[0] || null;
    const consistencyLeader = stats.filter(x=>x.races>1).slice().sort((a,b)=>(a.consistencyScore??9e15)-(b.consistencyScore??9e15)||((a.avgPos??9e15)-(b.avgPos??9e15))||((b.p1||0)-(a.p1||0)))[0] || stats.slice().sort((a,b)=>(a.consistencyScore??9e15)-(b.consistencyScore??9e15))[0] || null;

    el.innerHTML = `
      <div class="card">
        <div class="card-h"><h2>Renntag Auswertung</h2></div>
        <div class="card-b">
          <div class="row wrap" style="gap:10px">
            <span class="badge">Renntag: ${esc(rd.name)}</span>
            <span class="badge">Sessions: ${races.length}</span>
            <span class="badge">Fahrer: ${stats.length}</span>
          </div>
          <div class="row wrap discord-preview-wrap" style="gap:10px; margin-top:12px">
            <div class="card" style="width:100%">
              <div class="card-h"><h3>Discord Vorschau</h3></div>
              <div class="card-b">
                <div class="discord-preview-grid">
                  <div class="discord-preview-pane">
                    <div class="muted small" style="margin-bottom:8px">Text</div>
                    <pre class="discord-preview-text" id="raceDayDiscordPreviewText">Lade Vorschau...</pre>
                  </div>
                  <div class="discord-preview-pane">
                    <div class="muted small" style="margin-bottom:8px">Bild</div>
                    <div class="discord-preview-imagebox" id="raceDayDiscordPreviewImage"><div class="muted small">Lade Bild...</div></div>
                  </div>
                </div>
                <div class="row wrap" style="gap:10px; margin-top:12px">
                  <button class="btn" id="btnRaceDayForumCopy" type="button">Forum-Text kopieren</button>
                  <button class="btn" id="btnRaceDayWebhook" type="button">Renntag an Discord senden</button>
                </div>
                <div class="muted small" style="margin-top:8px">Vorschau von Text und Bild, die an Discord gesendet werden. FÃ¼r Forum-KanÃ¤le kann optional ein Thread/Post erstellt werden.</div>
              </div>
            </div>
          </div>
          <div class="muted small" style="margin-top:8px">Sendet pro Strecke alle Fahrer mit ihrer besten Runde dieses Renntags. Für Forum-Kanäle kann optional ein Thread/Post erstellt werden.</div>
          <div class="hr"></div>
          <div class="renntag-highlights-grid" style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:12px; align-items:stretch">
            <div class="card"><div class="card-b"><div class="muted small">Meiste Siege</div><div style="font-weight:800; font-size:20px; margin-top:4px">${winsLeader?esc(winsLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${winsLeader?`${winsLeader.p1} Sieg${winsLeader.p1===1?'':'e'}`:'Keine Daten'}</div></div></div>
            <div class="card"><div class="card-b"><div class="muted small">Meiste Podien</div><div style="font-weight:800; font-size:20px; margin-top:4px">${podiumLeader?esc(podiumLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${podiumLeader?`${podiumLeader.podiums} Podien`:'Keine Daten'}</div></div></div>
            <div class="card"><div class="card-b"><div class="muted small">Meiste schnellste Runden</div><div style="font-weight:800; font-size:20px; margin-top:4px">${fastestLeader?esc(fastestLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${fastestLeader?`${fastestLeader.fastestLapCount}x schnellste Runde`:'Keine Daten'}</div></div></div>
            <div class="card"><div class="card-b"><div class="muted small">Konstant am stärksten</div><div style="font-weight:800; font-size:20px; margin-top:4px">${consistencyLeader?esc(consistencyLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${consistencyLeader && consistencyLeader.avgPos!=null?`Ø Platz ${esc((consistencyLeader.avgPos||0).toFixed(2).replace('.',','))}`:'Keine Daten'}</div></div></div>
          </div>
          <div class="hr"></div>
          <table class="table">
            <thead><tr><th>Fahrer</th><th>Rennen</th><th>Siege</th><th>Podien</th><th>Schnellste Runde</th><th>Ø Platzierung</th><th>Ø Runde</th><th>Bestzeiten je Strecke</th></tr></thead>
            <tbody>
              ${stats.map(x=>`
                <tr>
                  <td>${esc(x.driver.name||'—')}</td>
                  <td>${x.races||0}</td>
                  <td>${x.p1||0}</td>
                  <td>${x.podiums||0}</td>
                  <td>${x.fastestLapCount||0}</td>
                  <td>${x.avgPos!=null ? esc(x.avgPos.toFixed(2).replace('.',',')) : '—'}</td>
                  <td class="mono">${x.avgMs!=null ? esc(msToTime(x.avgMs,3)) : '—'}</td>
                  <td>${renderBestByTrackCell(x.bestByTrack)}</td>
                </tr>
              `).join('') || `<tr><td colspan="8" class="muted">Keine Daten.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="card-h"><h2>Session Auswertung</h2></div>
        <div class="card-b">
          <div class="field">
            <label>Session</label>
            <select id="analysisRaceSel">
              ${races.map(r=>`<option value="${esc(r.id)}" ${r.id===selectedRaceId?'selected':''}>${esc(r.name)} • ${esc(getRaceTrackName(r))}</option>`).join('') || `<option value="">(keine Sessions)</option>`}
            </select>
          </div>
          <div class="row wrap" style="gap:10px; margin-top:12px">
            <button class="btn" id="btnAnalysisSessionDiscord" type="button" ${race?'':'disabled'}>Session an Discord senden</button>
          </div>
          <div class="muted small" style="margin-top:8px">Sendet die aktuell ausgewählte Session mit Summary-Grafik und Rundenübersicht an den Session-Webhook.</div>
          ${race ? `
            <div class="hr"></div>
            <div class="muted">${race.endedAt ? 'Podium' : 'Aktuelle Platzierung'}</div>
            ${renderPodiumSectionGlobal(race)}
          ` : ''}
          <div class="hr"></div>
          ${renderSessionDriverColumns(race)}
        </div>
      </div>
    `;

    const sel = el.querySelector('#analysisRaceSel');
    if(sel) sel.onchange = (e)=>{ state.ui.analysisRaceId = e.target.value; state.ui.analysisSessionDriverId = ''; saveState(); renderRenntagAuswertung(); };
    const dsel = el.querySelector('#analysisSessionDriverSel');
    if(dsel) dsel.onchange = (e)=>{ state.ui.analysisSessionDriverId = e.target.value; saveState(); renderRenntagAuswertung(); };
    const previewRoot = el;
    Promise.resolve().then(async ()=>{
      try{
        const msg = buildRaceDayWebhookMessage(rd.id);
        const blob = await renderRaceDayWebhookBlob(rd.id);
        if(previewRoot !== document.getElementById('pageRenntagAuswertung')) return;
        setDiscordPreviewText(previewRoot, '#raceDayDiscordPreviewText', formatDiscordPayloadPreview(msg.payload));
        setDiscordPreviewImage(previewRoot, '#raceDayDiscordPreviewImage', blob, 'Renntag Discord Vorschau');
      }catch(err){
        setDiscordPreviewText(previewRoot, '#raceDayDiscordPreviewText', 'Vorschau konnte nicht geladen werden.');
        setDiscordPreviewImage(previewRoot, '#raceDayDiscordPreviewImage', null, 'Vorschau konnte nicht geladen werden');
        logLine('Renntag Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
    });
    el.querySelectorAll('[data-del-lap-analysis]').forEach(btn=>{
      btn.onclick = ()=>{
        deleteLapById(btn.getAttribute('data-del-lap-analysis'));
        renderRenntagAuswertung();
        renderRenntag();
        renderDashboard();
      };
    });
    const btnRaceDayWebhook = el.querySelector('#btnRaceDayWebhook');
    if(btnRaceDayWebhook){
      btnRaceDayWebhook.onclick = async ()=>{
        btnRaceDayWebhook.disabled = true;
        const prev = btnRaceDayWebhook.textContent;
        btnRaceDayWebhook.textContent = 'Sende...';
        try{
          await sendRaceDayWebhook(rd.id);
          toast('Discord','Renntag gesendet.','ok');
          logLine('Renntag Webhook gesendet: ' + (rd.name||rd.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Renntag in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Renntag ' + String(rd.name || rd.id));
          }else{
            toast('Discord','Renntag-Webhook fehlgeschlagen.','err');
            logLine('Renntag Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnRaceDayWebhook.disabled = false;
          btnRaceDayWebhook.textContent = prev;
        }
      };
    }
    const btnRaceDayForumCopy = el.querySelector('#btnRaceDayForumCopy');
    if(btnRaceDayForumCopy){
      btnRaceDayForumCopy.onclick = async ()=>{
        try{
          const msg = buildRaceDayWebhookMessage(rd.id);
          await copyTextToClipboard(msg.forumText);
          toast('Forum','Renntag-Text kopiert.','ok');
        }catch(err){
          toast('Forum','Kopieren fehlgeschlagen.','err');
          logLine('Renntag Forum-Text Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
    }
    const btnAnalysisSessionDiscord = el.querySelector('#btnAnalysisSessionDiscord');
    if(btnAnalysisSessionDiscord){
      btnAnalysisSessionDiscord.onclick = async ()=>{
        if(!race) return;
        btnAnalysisSessionDiscord.disabled = true;
        const prev = btnAnalysisSessionDiscord.textContent;
        btnAnalysisSessionDiscord.textContent = 'Sende...';
        try{
          await sendDiscordSummaryForRace(race.id, { force:true });
          toast('Discord','Session gesendet.','ok');
          logLine('Session Webhook gesendet: ' + (race.name||race.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Session in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Session ' + String(race.name || race.id));
          }else{
            toast('Discord','Session-Webhook fehlgeschlagen.','err');
            logLine('Session Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnAnalysisSessionDiscord.disabled = false;
          btnAnalysisSessionDiscord.textContent = prev;
        }
      };
    }
  }


  function getSeasonScoringRaces(seasonId){
    return getRacesForSeason(seasonId)
      .filter(r => !!r?.endedAt && raceShouldShowPodium(r))
      .sort((a,b)=>(a.startedAt||0)-(b.startedAt||0));
  }

  function getFastestDriverIdFromLaps(laps){
    let bestDid = '';
    let bestMs = Infinity;
    for(const lap of (laps||[])){
      const did = String(lap?.driverId || (lap?.carId ? (getCar(lap.carId)?.driverId||'') : '') || '').trim();
      const ms = Number(lap?.lapMs || 0);
      if(!did || !(ms>0)) continue;
      if(ms < bestMs){ bestMs = ms; bestDid = did; }
    }
    return bestDid;
  }

  function getSeasonPointsColor(key, idx){
    const src = String(key||idx||'x');
    let h = 0;
    for(let i=0;i<src.length;i++) h = (h*31 + src.charCodeAt(i)) % 360;
    return `hsl(${h}, 72%, 58%)`;
  }

  function sumBestPoints(values, limit){
    const arr = (values||[]).slice().sort((a,b)=>b-a);
    if(limit>0) arr.length = Math.min(arr.length, limit);
    return arr.reduce((a,b)=>a+(Number(b)||0),0);
  }

  function getSeasonBaseRows(seasonId){
    const allLaps = state.session.laps || [];
    const races = getSeasonScoringRaces(seasonId);
    const byId = {};
    const raceLabels = [];

    for(const race of races){
      const laps = getRelevantRaceLaps(race.id, allLaps);
      const standings = computeDriverStandingsGlobal(laps);
      const participants = standings.length;
      if(!participants) continue;
      const fastestDid = getFastestDriverIdFromLaps(laps);
      const raceIndex = raceLabels.length;
      raceLabels.push({
        id: race.id,
        label: `${raceIndex+1}`,
        trackName: getRaceTrackName(race),
        name: race.name || `Rennen ${raceIndex+1}`,
        participants,
        fastestDriverId: fastestDid || ''
      });
      for(const s of standings){
        if(!byId[s.id]){
          const driver = getDriver(s.id) || { id:s.id, name:s.name||'—' };
          byId[s.id] = {
            driver,
            races:0,
            wins:0,
            podiums:0,
            fastestLapCount:0,
            positions:[],
            grossHistory:[],
            color: getSeasonPointsColor(driver.id || driver.name, Object.keys(byId).length),
            avgMs:null,
            bestByTrack:{},
            perRaceStats:[],
            racePointValues:[],
            fastestBonusFlags:[]
          };
        }
      }
      standings.forEach((s, idx)=>{
        const row = byId[s.id];
        const pos = idx + 1;
        row.races += 1;
        row.positions.push(pos);
        if(pos===1) row.wins += 1;
        if(pos<=3) row.podiums += 1;
        row.perRaceStats.push({
          raceId: race.id,
          raceName: race.name || `Rennen ${raceIndex+1}`,
          raceLabel: `${raceIndex+1}`,
          participants,
          position: pos,
          laps: s.laps,
          totalMs: s.totalMs,
          bestMs: s.bestMs,
          finalGapMs: s.finalGapMs,
          wasFastest: fastestDid === s.id
        });
      });
      if(fastestDid && byId[fastestDid]) byId[fastestDid].fastestLapCount += 1;
      const ids = Object.keys(byId);
      for(const id of ids){
        const row = byId[id];
        row.grossHistory.push(row.races);
      }
    }

    const raceIdSet = new Set(races.map(r=>r.id));
    const lapsSubset = allLaps.filter(l=>raceIdSet.has(l.raceId));
    const rows = Object.values(byId);
    for(const row of rows){
      row.avgMs = getAverageValidLapMsForDriver(row.driver.id, lapsSubset);
      row.bestByTrack = getBestTimesByTrackForDriver(row.driver.id, lapsSubset);
      if(row.positions.length){
        row.avgPos = row.positions.reduce((a,b)=>a+b,0) / row.positions.length;
        const variance = row.positions.reduce((a,p)=>a + Math.pow(p-row.avgPos,2),0) / row.positions.length;
        row.posStdDev = Math.sqrt(variance);
        row.consistencyScore = (row.avgPos * 1000) + (row.posStdDev * 120) - (row.wins * 20) - (row.fastestLapCount * 5);
      }else{
        row.avgPos = null;
        row.posStdDev = null;
        row.consistencyScore = null;
      }
    }
    rows.sort((a,b)=>(b.wins-a.wins)||(b.podiums-a.podiums)||(b.fastestLapCount-a.fastestLapCount)||((a.avgPos??9e15)-(b.avgPos??9e15))||((a.avgMs??9e15)-(b.avgMs??9e15))||((a.driver.name||'').localeCompare(b.driver.name||'','de')));
    return { races, raceLabels, rows };
  }

  function getSeasonStatisticsData(seasonId){
    return getSeasonBaseRows(seasonId);
  }

  function getChampionshipSettings(){
    const ui = state.ui = state.ui || {};
    return {
      countedRaces: Math.max(0, Number(ui.championshipCountedRaces ?? 5) || 5),
      factor: Math.max(1, Number(ui.championshipFactor ?? 4) || 4),
      fastestLapPoints: Math.max(0, Number(ui.championshipFastestLapPoints ?? 1) || 1),
      countedFastestLaps: Math.max(0, Number(ui.championshipCountedFastestLaps ?? 5) || 5)
    };
  }

  function getChampionshipData(seasonId, settings){
    const base = getSeasonBaseRows(seasonId);
    const byId = {};
    const raceLabels = base.raceLabels.map(x=>({ ...x }));

    for(const row of (base.rows||[])){
      byId[row.driver.id] = {
        driver: row.driver,
        color: row.color,
        races: row.races,
        wins: row.wins,
        podiums: row.podiums,
        fastestLapCount: row.fastestLapCount,
        avgPos: row.avgPos,
        avgMs: row.avgMs,
        bestByTrack: row.bestByTrack,
        consistencyScore: row.consistencyScore,
        positions: row.positions.slice(),
        racePoints: [],
        racePointValues: [],
        bonusFlags: [],
        bonusValues: [],
        countedRacePoints: 0,
        discardedRacePoints: 0,
        countedBonusPoints: 0,
        discardedBonusPoints: 0,
        totalPoints: 0,
        countedRaceResults: 0,
        countedFastestResults: 0,
        grossHistory: [],
        countedHistory: []
      };
    }

    for(const race of base.races){
      const laps = getRelevantRaceLaps(race.id, state.session.laps || []);
      const standings = computeDriverStandingsGlobal(laps);
      const participants = standings.length;
      const fastestDid = getFastestDriverIdFromLaps(laps);
      if(!participants) continue;

      for(const s of standings){
        const row = byId[s.id];
        if(!row) continue;
        const pos = standings.findIndex(x=>x.id===s.id) + 1;
        const pts = Math.max(1, participants - (pos-1)) * settings.factor;
        row.racePointValues.push(pts);
        row.racePoints.push({ raceId: race.id, points: pts, position: pos, participants, raceName: race.name || '' });
        const hasFastest = fastestDid === s.id;
        row.bonusFlags.push(hasFastest ? 1 : 0);
        row.bonusValues.push(hasFastest ? settings.fastestLapPoints : 0);
      }
      for(const id of Object.keys(byId)){
        const row = byId[id];
        row.grossHistory.push(
          row.racePointValues.reduce((a,b)=>a+(Number(b)||0),0) + row.bonusValues.reduce((a,b)=>a+(Number(b)||0),0)
        );
        row.countedHistory.push(
          sumBestPoints(row.racePointValues, settings.countedRaces) + sumBestPoints(row.bonusValues, settings.countedFastestLaps)
        );
      }
    }

    const rows = Object.values(byId);
    for(const row of rows){
      row.countedRacePoints = sumBestPoints(row.racePointValues, settings.countedRaces);
      row.discardedRacePoints = Math.max(0, row.racePointValues.reduce((a,b)=>a+(Number(b)||0),0) - row.countedRacePoints);
      row.countedBonusPoints = sumBestPoints(row.bonusValues, settings.countedFastestLaps);
      row.discardedBonusPoints = Math.max(0, row.bonusValues.reduce((a,b)=>a+(Number(b)||0),0) - row.countedBonusPoints);
      row.totalPoints = row.countedRacePoints + row.countedBonusPoints;
      row.countedRaceResults = settings.countedRaces>0 ? Math.min(row.racePointValues.length, row.racePointValues.slice().sort((a,b)=>b-a).slice(0, settings.countedRaces).length) : row.racePointValues.length;
      row.countedFastestResults = settings.countedFastestLaps>0 ? Math.min(row.bonusFlags.reduce((a,b)=>a+b,0), settings.countedFastestLaps) : row.bonusFlags.reduce((a,b)=>a+b,0);
    }
    rows.sort((a,b)=>(b.totalPoints-a.totalPoints)||(b.countedRacePoints-a.countedRacePoints)||(b.countedBonusPoints-a.countedBonusPoints)||(b.wins-a.wins)||(b.podiums-a.podiums)||((a.avgPos??9e15)-(b.avgPos??9e15))||((a.driver.name||'').localeCompare(b.driver.name||'','de')));
    return { races: base.races, raceLabels, rows, settings };
  }

  function renderSeasonPointsChart(data, mode){
    const key = mode==='championship' ? 'countedHistory' : 'grossHistory';
    const rows = (data?.rows||[]).filter(r=>(r[key]||[]).some(v=>v>0));
    const labels = data?.raceLabels||[];
    if(!labels.length || !rows.length) return '<div class="muted">Noch keine gewerteten Rennen.</div>';
    const W=980, H=300, L=54, R=18, T=18, B=38;
    const maxY = Math.max(1, ...rows.flatMap(r=>r[key]||[0]));
    const n = Math.max(1, labels.length-1);
    const xAt = (i)=> L + ((W-L-R) * (labels.length===1 ? 0.5 : (i / n)));
    const yAt = (v)=> T + ((H-T-B) * (1 - (v / maxY)));
    const yTicks = Array.from({length:5}, (_,i)=>Math.round((maxY/4) * i));
    const lines = rows.map((row)=>{
      const series = row[key] || [];
      const pts = series.map((v,i)=>`${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
      const endX = xAt(series.length-1);
      const endY = yAt(series[series.length-1]);
      return `
        <polyline fill="none" stroke="${row.color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" points="${pts}"/>
        ${series.map((v,i)=>`<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(v).toFixed(1)}" r="3.5" fill="${row.color}"/>`).join('')}
        <text x="${Math.min(W-6, endX+8).toFixed(1)}" y="${Math.max(12, endY-8).toFixed(1)}" fill="${row.color}" font-size="12" font-weight="700">${esc(row.driver.name||'—')}</text>
      `;
    }).join('');
    const sub = mode==='championship'
      ? 'X-Achse: Rennen dieser Saison • Y-Achse: Meisterschaftspunkte nach aktueller Regel'
      : 'X-Achse: Rennen dieser Saison • Y-Achse: kumulierte Saisondaten';
    return `
      <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:auto; display:block; background:#0f131a; border-radius:16px; border:1px solid rgba(255,255,255,.08)">
        ${yTicks.map(v=>`<g><line x1="${L}" y1="${yAt(v).toFixed(1)}" x2="${W-R}" y2="${yAt(v).toFixed(1)}" stroke="rgba(255,255,255,.08)"/><text x="${L-10}" y="${(yAt(v)+4).toFixed(1)}" fill="rgba(255,255,255,.6)" font-size="11" text-anchor="end">${v}</text></g>`).join('')}
        ${labels.map((lab,i)=>`<g><line x1="${xAt(i).toFixed(1)}" y1="${T}" x2="${xAt(i).toFixed(1)}" y2="${H-B}" stroke="rgba(255,255,255,.05)"/><text x="${xAt(i).toFixed(1)}" y="${H-14}" fill="rgba(255,255,255,.7)" font-size="11" text-anchor="middle">${esc(lab.label)}</text></g>`).join('')}
        <line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="rgba(255,255,255,.18)"/>
        <line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="rgba(255,255,255,.18)"/>
        ${lines}
      </svg>
      <div class="muted small" style="margin-top:8px">${sub}</div>
    `;
  }

  function renderSaisonAuswertung(){
    const el = document.getElementById('pageSaisonAuswertung');
    const active = getActiveSeason();
    if(!active){ el.innerHTML='<div class="card"><div class="card-b">Keine Saison.</div></div>'; return; }

    const stats = getSeasonStatisticsData(active.id);
    const statRows = stats.rows;
    const statWinsLeader = statRows.slice().sort((a,b)=>(b.wins-a.wins)||(b.races-a.races))[0] || null;
    const statPodiumLeader = statRows.slice().sort((a,b)=>(b.podiums-a.podiums)||(b.wins-a.wins))[0] || null;
    const statFastestLeader = statRows.slice().sort((a,b)=>(b.fastestLapCount-a.fastestLapCount)||(b.wins-a.wins))[0] || null;
    const statConsistencyLeader = statRows.filter(x=>x.races>1).slice().sort((a,b)=>(a.consistencyScore??9e15)-(b.consistencyScore??9e15)||((b.wins||0)-(a.wins||0)))[0] || statRows[0] || null;

    const champSettings = getChampionshipSettings();
    const champ = getChampionshipData(active.id, champSettings);
    const champRows = champ.rows;
    const champLeader = champRows[0] || null;
    const champRaceLeader = champRows.slice().sort((a,b)=>(b.countedRacePoints-a.countedRacePoints)||(b.wins-a.wins))[0] || null;
    const champBonusLeader = champRows.slice().sort((a,b)=>(b.countedBonusPoints-a.countedBonusPoints)||(b.fastestLapCount-a.fastestLapCount))[0] || null;
    const champStreakLeader = champRows.slice().sort((a,b)=>((b.totalPoints-(b.discardedRacePoints+b.discardedBonusPoints)) - (a.totalPoints-(a.discardedRacePoints+a.discardedBonusPoints)))||((b.totalPoints||0)-(a.totalPoints||0)))[0] || null;

    el.innerHTML = `
      <div class="card">
        <div class="card-h"><h2>Saison Auswertung</h2></div>
        <div class="card-b">
          <div class="row wrap" style="gap:10px; align-items:center; margin-bottom:14px">
            <span class="badge">Saison: ${esc(active.name)}</span>
            <span class="badge">Renntage: ${getRaceDaysForSeason(active.id).length}</span>
            <span class="badge">Rennen dieser Saison: ${stats.races.length}</span>
            <span class="badge">Fahrer: ${statRows.length}</span>
          </div>
          <div class="row wrap discord-preview-wrap" style="gap:10px; margin-bottom:12px">
            <div class="card" style="width:100%">
              <div class="card-h"><h3>Discord Vorschau</h3></div>
              <div class="card-b">
                <div class="discord-preview-grid">
                  <div class="discord-preview-pane">
                    <div class="muted small" style="margin-bottom:8px">Text</div>
                    <pre class="discord-preview-text" id="seasonDiscordPreviewText">Lade Vorschau...</pre>
                  </div>
                  <div class="discord-preview-pane">
                    <div class="muted small" style="margin-bottom:8px">Bild</div>
                    <div class="discord-preview-imagebox" id="seasonDiscordPreviewImage"><div class="muted small">Lade Bild...</div></div>
                  </div>
                </div>
                <div class="row wrap" style="gap:10px; margin-top:12px">
                  <button class="btn" id="btnSeasonForumCopy" type="button">Forum-Text kopieren</button>
                  <button class="btn" id="btnSeasonWebhook" type="button">Saison an Discord senden</button>
                </div>
                <div class="muted small" style="margin-top:8px">Vorschau von Text und Bild, die an Discord gesendet werden. Fuer Forum-Kanaele kann optional direkt ein Thread/Post erstellt werden.</div>
              </div>
            </div>
          </div>
          <div class="muted small" style="margin-bottom:14px">Sendet Gesamtwertung und Awards an Discord. Für Forum-Kanäle kann optional direkt ein Thread/Post erstellt werden.</div>

          <div class="card" style="margin-bottom:14px">
            <div class="card-h"><h3>Saison Statistik</h3></div>
            <div class="card-b">
              <div class="renntag-highlights-grid" style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:12px; align-items:stretch">
                <div class="card"><div class="card-b"><div class="muted small">Meiste Siege</div><div style="font-weight:800; font-size:20px; margin-top:4px">${statWinsLeader?esc(statWinsLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${statWinsLeader?`${statWinsLeader.wins} Sieg${statWinsLeader.wins===1?'':'e'}`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Meiste Podien</div><div style="font-weight:800; font-size:20px; margin-top:4px">${statPodiumLeader?esc(statPodiumLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${statPodiumLeader?`${statPodiumLeader.podiums} Podien`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Meiste schnellste Runden</div><div style="font-weight:800; font-size:20px; margin-top:4px">${statFastestLeader?esc(statFastestLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${statFastestLeader?`${statFastestLeader.fastestLapCount}x schnellste Runde`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Konstantester Fahrer</div><div style="font-weight:800; font-size:20px; margin-top:4px">${statConsistencyLeader?esc(statConsistencyLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${statConsistencyLeader && statConsistencyLeader.avgPos!=null?`Ø Platz ${esc((statConsistencyLeader.avgPos||0).toFixed(2).replace('.',','))}`:'Keine Daten'}</div></div></div>
              </div>
              <div class="hr"></div>
              <div class="card" style="margin-bottom:12px"><div class="card-b"><div class="muted small" style="margin-bottom:8px">Saisonverlauf</div>${renderSeasonPointsChart(stats, 'stats')}</div></div>
              <table class="table">
                <thead><tr><th>#</th><th>Fahrer</th><th>Starts</th><th>Siege</th><th>Podien</th><th>Schnellste Runden</th><th>Ø Platzierung</th><th>Ø Runde</th><th>Bestzeiten je Strecke</th></tr></thead>
                <tbody>
                  ${statRows.map((x,idx)=>`
                    <tr>
                      <td>${idx+1}</td>
                      <td><span style="display:inline-flex; align-items:center; gap:8px"><span style="width:10px; height:10px; border-radius:999px; background:${x.color}; display:inline-block"></span>${esc(x.driver.name||'—')}</span></td>
                      <td>${x.races||0}</td>
                      <td>${x.wins||0}</td>
                      <td>${x.podiums||0}</td>
                      <td>${x.fastestLapCount||0}</td>
                      <td>${x.avgPos!=null ? esc(x.avgPos.toFixed(2).replace('.',',')) : '—'}</td>
                      <td class="mono">${x.avgMs!=null ? esc(msToTime(x.avgMs,3)) : '—'}</td>
                      <td>${renderBestByTrackCell(x.bestByTrack)}</td>
                    </tr>
                  `).join('') || `<tr><td colspan="9" class="muted">Keine Daten.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>

          <div class="card settings-card">
            <div class="card-h"><h3>Meisterschaft</h3></div>
            <div class="card-b">
              <div class="grid cols-4" style="gap:12px; align-items:end">
                <div class="field">
                  <label>Gewertete Rennen</label>
                  <input class="input" id="championshipCountedRaces" type="number" min="0" step="1" value="${champSettings.countedRaces}" />
                  <div class="muted small" style="margin-top:6px">0 = alle, sonst zählen die punktstärksten Rennen.</div>
                </div>
                <div class="field">
                  <label>Gewertete schnellste Runden</label>
                  <input class="input" id="championshipCountedFastestLaps" type="number" min="0" step="1" value="${champSettings.countedFastestLaps}" />
                  <div class="muted small" style="margin-top:6px">0 = alle Bonus-Ergebnisse zählen.</div>
                </div>
                <div class="field">
                  <label>Punktefaktor pro Fahrer</label>
                  <input class="input" id="championshipFactor" type="number" min="1" step="1" value="${champSettings.factor}" />
                  <div class="muted small" style="margin-top:6px">Bei 10 Fahrern: 1. Platz = 10 × Faktor.</div>
                </div>
                <div class="field">
                  <label>Punkte für schnellste Runde</label>
                  <input class="input" id="championshipFastestLapPoints" type="number" min="0" step="1" value="${champSettings.fastestLapPoints}" />
                  <div class="muted small" style="margin-top:6px">Bonuspunkte pro Rennen für die schnellste Runde.</div>
                </div>
              </div>
              <div class="row wrap" style="gap:10px; margin-top:10px">
                <span class="badge">Nur echte Rennen dieser Saison</span>
                <span class="badge">Standard: 5 Rennen • Faktor 4 • 1 Punkt • 5 Bonus-Wertungen</span>
              </div>
              <div class="hr"></div>
              <div class="renntag-highlights-grid" style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:12px; align-items:stretch">
                <div class="card"><div class="card-b"><div class="muted small">Meisterschaftsführer</div><div style="font-weight:800; font-size:20px; margin-top:4px">${champLeader?esc(champLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${champLeader?`${champLeader.totalPoints} Punkte`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Meiste Rennpunkte</div><div style="font-weight:800; font-size:20px; margin-top:4px">${champRaceLeader?esc(champRaceLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${champRaceLeader?`${champRaceLeader.countedRacePoints} Punkte`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Meiste Bonuspunkte</div><div style="font-weight:800; font-size:20px; margin-top:4px">${champBonusLeader?esc(champBonusLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${champBonusLeader?`${champBonusLeader.countedBonusPoints} Punkte`:'Keine Daten'}</div></div></div>
                <div class="card"><div class="card-b"><div class="muted small">Stärkste Punkteausbeute</div><div style="font-weight:800; font-size:20px; margin-top:4px">${champStreakLeader?esc(champStreakLeader.driver.name):'—'}</div><div class="muted" style="margin-top:4px">${champStreakLeader?`${champStreakLeader.totalPoints} Gesamtpunkte`:'Keine Daten'}</div></div></div>
              </div>
              <div class="hr"></div>
              <div class="card" style="margin-bottom:12px"><div class="card-b"><div class="muted small" style="margin-bottom:8px">Meisterschaftsverlauf</div>${renderSeasonPointsChart(champ, 'championship')}</div></div>
              <table class="table">
                <thead><tr><th>#</th><th>Fahrer</th><th>Gesamt</th><th>Rennpunkte</th><th>Bonus SR</th><th>Streicher Rennen</th><th>Streicher SR</th><th>Siege</th><th>Podien</th><th>Schnellste Runden</th></tr></thead>
                <tbody>
                  ${champRows.map((x,idx)=>`
                    <tr>
                      <td>${idx+1}</td>
                      <td><span style="display:inline-flex; align-items:center; gap:8px"><span style="width:10px; height:10px; border-radius:999px; background:${x.color}; display:inline-block"></span>${esc(x.driver.name||'—')}</span></td>
                      <td><b>${x.totalPoints||0}</b></td>
                      <td>${x.countedRacePoints||0}</td>
                      <td>${x.countedBonusPoints||0}</td>
                      <td>${x.discardedRacePoints||0}</td>
                      <td>${x.discardedBonusPoints||0}</td>
                      <td>${x.wins||0}</td>
                      <td>${x.podiums||0}</td>
                      <td>${x.fastestLapCount||0}</td>
                    </tr>
                  `).join('') || `<tr><td colspan="10" class="muted">Keine Daten.</td></tr>`}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    const seasonPreviewRoot = el;
    Promise.resolve().then(async ()=>{
      try{
        const msg = buildSeasonWebhookMessage(active.id);
        const blob = await renderSeasonWebhookBlob(active.id);
        if(seasonPreviewRoot !== document.getElementById('pageSaisonAuswertung')) return;
        setDiscordPreviewText(seasonPreviewRoot, '#seasonDiscordPreviewText', formatDiscordPayloadPreview(msg.payload));
        setDiscordPreviewImage(seasonPreviewRoot, '#seasonDiscordPreviewImage', blob, 'Saison Discord Vorschau');
      }catch(err){
        setDiscordPreviewText(seasonPreviewRoot, '#seasonDiscordPreviewText', 'Vorschau konnte nicht geladen werden.');
        setDiscordPreviewImage(seasonPreviewRoot, '#seasonDiscordPreviewImage', null, 'Vorschau konnte nicht geladen werden');
        logLine('Saison Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
    });
    const btnSeasonWebhook = el.querySelector('#btnSeasonWebhook');
    if(btnSeasonWebhook){
      btnSeasonWebhook.onclick = async ()=>{
        btnSeasonWebhook.disabled = true;
        const prev = btnSeasonWebhook.textContent;
        btnSeasonWebhook.textContent = 'Sende...';
        try{
          await sendSeasonWebhook(active.id);
          toast('Discord','Saison gesendet.','ok');
          logLine('Saison Webhook gesendet: ' + (active.name||active.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Saison in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Saison ' + String(active.name || active.id));
          }else{
            toast('Discord','Saison-Webhook fehlgeschlagen.','err');
            logLine('Saison Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnSeasonWebhook.disabled = false;
          btnSeasonWebhook.textContent = prev;
        }
      };
    }
    const btnSeasonForumCopy = el.querySelector('#btnSeasonForumCopy');
    if(btnSeasonForumCopy){
      btnSeasonForumCopy.onclick = async ()=>{
        try{
          const msg = buildSeasonWebhookMessage(active.id);
          await copyTextToClipboard(msg.forumText);
          toast('Forum','Saison-Text kopiert.','ok');
        }catch(err){
          toast('Forum','Kopieren fehlgeschlagen.','err');
          logLine('Saison Forum-Text Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
    }
    const bindNum = (id, key)=>{
      const inp = el.querySelector('#'+id);
      if(!inp) return;
      inp.onchange = ()=>{
        state.ui = state.ui || {};
        state.ui[key] = Math.max(0, Number(inp.value||0) || 0);
        if(key==='championshipFactor') state.ui[key] = Math.max(1, Number(inp.value||1) || 1);
        saveState();
        renderSaisonAuswertung();
      };
    };
    bindNum('championshipCountedRaces', 'championshipCountedRaces');
    bindNum('championshipCountedFastestLaps', 'championshipCountedFastestLaps');
    bindNum('championshipFactor', 'championshipFactor');
    bindNum('championshipFastestLapPoints', 'championshipFastestLapPoints');
  }

function renderRenntag(){
    const el = document.getElementById('pageRenntag');
    const rd = getActiveRaceDay();
    if(!rd){ el.innerHTML=`<div class="card"><div class="card-b">${esc(t('renntag.none'))}</div></div>`; return; }

    const races = rd.races.slice().sort((a,b)=>(b.startedAt||0)-(a.startedAt||0));
    const selectedRaceId = state.ui.selectedRaceId || (races[0]?.id || '');
    if(selectedRaceId && state.ui.selectedRaceId !== selectedRaceId){
      state.ui.selectedRaceId = selectedRaceId; saveState();
    }
    const race = races.find(r=>r.id===selectedRaceId) || null;
    const raceLaps = race ? state.session.laps.filter(l=>l.raceId===race.id) : [];
    const driverIds = Array.from(new Set(raceLaps.map(l=>l.driverId).filter(Boolean)));
    const carsIds = Array.from(new Set(raceLaps.map(l=>l.carId).filter(Boolean)));

    el.innerHTML = `
      <div class="card">
        <div class="card-h"><h2>${t('renntag.title')}</h2></div>
        <div class="card-b">
          <div class="muted">${t('renntag.intro')}</div>
          <div class="hr"></div>

          <div class="field">
            <label>${t('renntag.select_day')}</label>
            <select id="raceDaySel">
              ${state.raceDay.raceDays.slice().sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).map(d=>`<option value="${esc(d.id)}" ${d.id===state.raceDay.activeRaceDayId?'selected':''}>${esc(d.name)}</option>`).join('')}
            </select>
          </div>

          <div class="row">
            <button class="btn" id="raceDayNew">${t('renntag.new_day')}</button>
          </div>

          <div class="hr"></div>

          <div class="field">
            <label>${t('renntag.select_session')}</label>
            <select id="raceSel">
              ${races.map(r=>`<option value="${esc(r.id)}" ${r.id===selectedRaceId?'selected':''}>${esc(r.name)}</option>`).join('') || `<option value="">${esc(t('renntag.no_sessions'))}</option>`}
            </select>
          </div>

          <div class="row" style="gap:10px; flex-wrap:wrap">
            <button class="btn" id="raceDelete">🗑 ${t('renntag.delete_session')}</button>
            <button class="btn" id="raceDeleteAll">🗑 ${t('renntag.delete_all_sessions')}</button>
          </div>

          <div class="hr"></div>
          <div class="row wrap">
            <span class="badge">${t('renntag.badge_laps', { count:raceLaps.length })}</span>
            <span class="badge">${t('renntag.badge_drivers', { count:driverIds.length })}</span>
            <span class="badge">${t('renntag.badge_cars', { count:carsIds.length })}</span>
          </div>
          <div class="hr"></div>
          <div class="card">
            <div class="card-h"><h3>${t('renntag.preview_title')}</h3></div>
            <div class="card-b">
              <div class="discord-preview-grid">
                <div class="discord-preview-pane">
                  <div class="muted small" style="margin-bottom:8px">${t('preview.text')}</div>
                  <pre class="discord-preview-text" id="raceDayMainPreviewText">${t('preview.loading')}</pre>
                </div>
                <div class="discord-preview-pane">
                  <div class="muted small" style="margin-bottom:8px">${t('preview.image')}</div>
                  <div class="discord-preview-imagebox" id="raceDayMainPreviewImage"><div class="muted small">${t('preview.loading_image')}</div></div>
                </div>
              </div>
              <div class="row wrap" style="gap:10px; margin-top:12px">
                <button class="btn" id="btnRaceDayMainForumCopy" type="button">${t('renntag.copy_forum')}</button>
                <button class="btn" id="btnRaceDayMainWebhook" type="button">${t('renntag.send')}</button>
              </div>
            </div>
          </div>
          <div class="hr"></div>
          <div class="card">
            <div class="card-h"><h3>${t('session.preview_title')}</h3></div>
            <div class="card-b">
              <div class="discord-preview-grid">
                <div class="discord-preview-pane">
                  <div class="muted small" style="margin-bottom:8px">${t('preview.text')}</div>
                  <pre class="discord-preview-text" id="sessionMainPreviewText">${race ? t('preview.loading') : t('preview.no_session')}</pre>
                </div>
                <div class="discord-preview-pane">
                  <div class="muted small" style="margin-bottom:8px">${t('preview.image')}</div>
                  <div class="discord-preview-imagebox" id="sessionMainPreviewImage"><div class="muted small">${race ? t('preview.loading_image') : t('preview.no_session')}</div></div>
                </div>
              </div>
              <div class="row wrap" style="gap:10px; margin-top:12px">
                <button class="btn" id="btnSessionMainWebhook" type="button" ${race?'':'disabled'}>${t('session.send')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const rds = el.querySelector('#raceDaySel');
    if(rds) rds.onchange = (e)=>{ state.raceDay.activeRaceDayId = e.target.value; state.ui.selectedRaceId=''; state.ui.selectedRaceDriverId=''; saveState(); renderRenntag(); };
    const btnNewRd = el.querySelector('#raceDayNew');
    if(btnNewRd) btnNewRd.onclick = ()=>{
      const id = uid('raceday');
      const name = (getUiLanguage()==='en' ? 'Race Day ' : 'Renntag ') + new Date().toLocaleDateString(getUiLocale()) + ' • ' + new Date().toLocaleTimeString(getUiLocale(),{hour12:false});
      const rd = { id, name, seasonId: state.season.activeSeasonId, trackId: state.tracks.activeTrackId, createdAt: now(), races: [] };
      state.raceDay.raceDays.push(rd);
      state.raceDay.activeRaceDayId = id;
      state.ui.selectedRaceId=''; state.ui.selectedRaceDriverId='';
      saveState();
      toast(t('renntag.title'), t('renntag.created'),'ok');
      logLine('Renntag erstellt: ' + name);
      renderRenntag(); renderSessionControl();
    };

    el.querySelector('#raceSel').onchange=(e)=>{ state.ui.selectedRaceId=e.target.value; state.ui.selectedRaceDriverId=''; saveState(); renderRenntag(); };
    const renntagPreviewRoot = el;
    Promise.resolve().then(async ()=>{
      try{
        const msg = buildRaceDayWebhookMessage(rd.id);
        const blob = await renderRaceDayWebhookBlob(rd.id);
        if(renntagPreviewRoot !== document.getElementById('pageRenntag')) return;
        setDiscordPreviewText(renntagPreviewRoot, '#raceDayMainPreviewText', formatDiscordPayloadPreview(msg.payload));
        setDiscordPreviewImage(renntagPreviewRoot, '#raceDayMainPreviewImage', blob, 'Renntag Discord Vorschau');
      }catch(err){
        setDiscordPreviewText(renntagPreviewRoot, '#raceDayMainPreviewText', t('preview.failed'));
        setDiscordPreviewImage(renntagPreviewRoot, '#raceDayMainPreviewImage', null, 'Vorschau konnte nicht geladen werden');
        logLine('Renntag Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
      }
    });
    if(race){
      Promise.resolve().then(async ()=>{
        try{
          const preview = await buildSessionDiscordPreview(race.id);
          if(renntagPreviewRoot !== document.getElementById('pageRenntag')) return;
          setDiscordPreviewText(renntagPreviewRoot, '#sessionMainPreviewText', formatDiscordPayloadPreview(preview.payload));
          setDiscordPreviewImage(renntagPreviewRoot, '#sessionMainPreviewImage', preview.blob, 'Session Discord Vorschau');
        }catch(err){
          setDiscordPreviewText(renntagPreviewRoot, '#sessionMainPreviewText', t('preview.failed'));
          setDiscordPreviewImage(renntagPreviewRoot, '#sessionMainPreviewImage', null, 'Vorschau konnte nicht geladen werden');
          logLine('Session Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      });
    }
    const btnRaceDayMainWebhook = el.querySelector('#btnRaceDayMainWebhook');
    if(btnRaceDayMainWebhook){
      btnRaceDayMainWebhook.onclick = async ()=>{
        btnRaceDayMainWebhook.disabled = true;
        const prev = btnRaceDayMainWebhook.textContent;
        btnRaceDayMainWebhook.textContent = t('button.sending');
        try{
          await sendRaceDayWebhook(rd.id);
          toast('Discord', t('renntag.sent'),'ok');
          logLine('Renntag Webhook gesendet: ' + (rd.name||rd.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Renntag in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Renntag ' + String(rd.name || rd.id));
          }else{
            toast('Discord', t('renntag.send_failed'),'err');
            logLine('Renntag Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnRaceDayMainWebhook.disabled = false;
          btnRaceDayMainWebhook.textContent = prev;
        }
      };
    }
    const btnRaceDayMainForumCopy = el.querySelector('#btnRaceDayMainForumCopy');
    if(btnRaceDayMainForumCopy){
      btnRaceDayMainForumCopy.onclick = async ()=>{
        try{
          const msg = buildRaceDayWebhookMessage(rd.id);
          await copyTextToClipboard(msg.forumText);
          toast('Forum', t('renntag.copied'),'ok');
        }catch(err){
          toast('Forum', t('copy.failed'),'err');
          logLine('Renntag Forum-Text Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
    }
    const btnSessionMainWebhook = el.querySelector('#btnSessionMainWebhook');
    if(btnSessionMainWebhook){
      btnSessionMainWebhook.onclick = async ()=>{
        if(!race) return;
        btnSessionMainWebhook.disabled = true;
        const prev = btnSessionMainWebhook.textContent;
        btnSessionMainWebhook.textContent = t('button.sending');
        try{
          await sendDiscordSummaryForRace(race.id, { force:true });
          toast('Discord', t('session.sent'),'ok');
          logLine('Session Webhook gesendet: ' + (race.name||race.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Session in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Session ' + String(race.name || race.id));
          }else{
            toast('Discord', t('session.send_failed'),'err');
            logLine('Session Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnSessionMainWebhook.disabled = false;
          btnSessionMainWebhook.textContent = prev;
        }
      };
    }
  }

  // -------- Saison --------
  function renderSaison(){
    const el = document.getElementById('pageSaison');
    const seasons = state.season.seasons.slice().sort((a,b)=>b.createdAt-a.createdAt);
    const active = getActiveSeason();
    el.innerHTML = `
      <div class="grid2">
        <div class="card">
          <div class="card-h"><h2>${t('season.title')}</h2></div>
          <div class="card-b">
            <div class="muted">${t('season.intro')}</div>
            <div class="hr"></div>
            <div class="field">
              <label>${t('season.active')}</label>
              <select id="seasonSel">
                ${seasons.map(s=>`<option value="${esc(s.id)}" ${s.id===state.season.activeSeasonId?'selected':''}>${esc(s.name)}${s.status==='active' ? ` (${t('season.status_active')})` : ` (${t('season.status_closed')})`}</option>`).join('')}
              </select>
            </div>
            <div class="field">
              <label>${t('season.name')}</label>
              <input class="input" id="seasonName" value="${esc(active?.name||'')}"/>
            </div>
            <div class="row">
              <button class="btn btn-primary" id="seasonSave">${t('season.save')}</button>
              <button class="btn btn-danger" id="seasonEnd">${t('season.end')}</button>
              <button class="btn" id="seasonNew">${t('season.new')}</button>
            </div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="card-h"><h2>${t('season.preview_title')}</h2></div>
        <div class="card-b">
          <div class="discord-preview-grid">
            <div class="discord-preview-pane">
              <div class="muted small" style="margin-bottom:8px">${t('preview.text')}</div>
              <pre class="discord-preview-text" id="seasonMainPreviewText">${active ? t('preview.loading') : t('season.no_active')}</pre>
            </div>
            <div class="discord-preview-pane">
              <div class="muted small" style="margin-bottom:8px">${t('preview.image')}</div>
              <div class="discord-preview-imagebox" id="seasonMainPreviewImage"><div class="muted small">${active ? t('preview.loading_image') : t('season.no_active')}</div></div>
            </div>
          </div>
          <div class="row wrap" style="gap:10px; margin-top:12px">
            <button class="btn" id="btnSeasonMainForumCopy" type="button" ${active?'':'disabled'}>${t('season.copy_forum')}</button>
            <button class="btn" id="btnSeasonMainWebhook" type="button" ${active?'':'disabled'}>${t('season.send')}</button>
          </div>
        </div>
      </div>
    `;
    const saisonPreviewRoot = el;
    if(active){
      Promise.resolve().then(async ()=>{
        try{
          const msg = buildSeasonWebhookMessage(active.id);
          const blob = await renderSeasonWebhookBlob(active.id);
          if(saisonPreviewRoot !== document.getElementById('pageSaison')) return;
          setDiscordPreviewText(saisonPreviewRoot, '#seasonMainPreviewText', formatDiscordPayloadPreview(msg.payload));
          setDiscordPreviewImage(saisonPreviewRoot, '#seasonMainPreviewImage', blob, 'Saison Discord Vorschau');
        }catch(err){
          setDiscordPreviewText(saisonPreviewRoot, '#seasonMainPreviewText', t('preview.failed'));
          setDiscordPreviewImage(saisonPreviewRoot, '#seasonMainPreviewImage', null, 'Vorschau konnte nicht geladen werden');
          logLine('Saison Vorschau Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      });
    }
    el.querySelector('#seasonSel').onchange=(e)=>{ state.season.activeSeasonId=e.target.value; saveState(); renderAll(); };
    el.querySelector('#seasonSave').onclick=()=>{
      const s=getActiveSeason(); if(!s) return;
      s.name = el.querySelector('#seasonName').value.trim() || s.name;
      saveState(); toast(t('season.title'), t('season.saved'),'ok'); renderAll();
    };
    el.querySelector('#seasonEnd').onclick=()=>{
      const s=getActiveSeason(); if(!s) return;
      s.status='closed'; s.endedAt=now();
      const id=uid('season'); const year=new Date().getFullYear();
      state.season.seasons.push({ id, name:t('season.new_name', { year }), status:'active', createdAt:now(), endedAt:null });
      state.season.activeSeasonId=id;
      for(const t of state.tracks.tracks){
        if(!t.recordsBySeason) t.recordsBySeason = {};
        t.recordsBySeason[id] = { ms:null, driverName:'', carName:'' };
      }
      saveState(); toast(t('season.title'), t('season.ended'),'ok'); renderAll();
    };
    el.querySelector('#seasonNew').onclick=()=>{
      for(const s of state.season.seasons){ if(s.status==='active'){ s.status='closed'; s.endedAt=now(); } }
      const id=uid('season'); const year=new Date().getFullYear();
      state.season.seasons.push({ id, name:t('season.new_name', { year }), status:'active', createdAt:now(), endedAt:null });
      state.season.activeSeasonId=id;
      for(const t of state.tracks.tracks){
        if(!t.recordsBySeason) t.recordsBySeason = {};
        t.recordsBySeason[id] = { ms:null, driverName:'', carName:'' };
      }
      saveState(); toast(t('season.title'), t('season.created'),'ok'); renderAll();
    };
    const btnSeasonMainWebhook = el.querySelector('#btnSeasonMainWebhook');
    if(btnSeasonMainWebhook){
      btnSeasonMainWebhook.onclick = async ()=>{
        const s = getActiveSeason();
        if(!s) return;
        btnSeasonMainWebhook.disabled = true;
        const prev = btnSeasonMainWebhook.textContent;
        btnSeasonMainWebhook.textContent = t('button.sending');
        try{
          await sendSeasonWebhook(s.id);
          toast('Discord', t('season.sent'),'ok');
          logLine('Saison Webhook gesendet: ' + (s.name||s.id));
        }catch(err){
          if(err?.queued){
            toast('Discord','Saison in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Saison ' + String(s.name || s.id));
          }else{
            toast('Discord', t('season.send_failed'),'err');
            logLine('Saison Webhook Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnSeasonMainWebhook.disabled = false;
          btnSeasonMainWebhook.textContent = prev;
        }
      };
    }
    const btnSeasonMainForumCopy = el.querySelector('#btnSeasonMainForumCopy');
    if(btnSeasonMainForumCopy){
      btnSeasonMainForumCopy.onclick = async ()=>{
        const s = getActiveSeason();
        if(!s) return;
        try{
          const msg = buildSeasonWebhookMessage(s.id);
          await copyTextToClipboard(msg.forumText);
          toast('Forum', t('season.copied'),'ok');
        }catch(err){
          toast('Forum', t('copy.failed'),'err');
          logLine('Saison Forum-Text Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
        }
      };
    }
  }


  // -------- Audio Asset DB --------
  let _audioAssetDbPromise = null;
  let _audioPreviewCtx = null;
  let _audioPreviewSource = null;
  let _audioPreviewGain = null;

  function getAudioContext(){
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) return null;
    if(!_audioPreviewCtx) _audioPreviewCtx = new Ctx();
    return _audioPreviewCtx;
  }

  function openAudioAssetDb(){
    if(_audioAssetDbPromise) return _audioAssetDbPromise;
    _audioAssetDbPromise = new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)) return reject(new Error('indexeddb_not_supported'));
      const req = indexedDB.open(AUDIO_ASSET_DB_NAME, 1);
      req.onupgradeneeded = ()=>{
        const db = req.result;
        if(!db.objectStoreNames.contains(AUDIO_ASSET_STORE)) db.createObjectStore(AUDIO_ASSET_STORE, { keyPath:'id' });
      };
      req.onsuccess = ()=>resolve(req.result);
      req.onerror = ()=>reject(req.error || new Error('indexeddb_open_failed'));
    });
    return _audioAssetDbPromise;
  }

  async function audioAssetPut(rec){
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readwrite');
      tx.objectStore(AUDIO_ASSET_STORE).put(rec);
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error || new Error('indexeddb_put_failed'));
    });
  }

  async function audioAssetGet(id){
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readonly');
      const req = tx.objectStore(AUDIO_ASSET_STORE).get(id);
      req.onsuccess = ()=>resolve(req.result || null);
      req.onerror = ()=>reject(req.error || new Error('indexeddb_get_failed'));
    });
  }

  async function audioAssetDelete(id){
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readwrite');
      tx.objectStore(AUDIO_ASSET_STORE).delete(id);
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error || new Error('indexeddb_delete_failed'));
    });
  }

  async function audioAssetGetAll(){
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readonly');
      const req = tx.objectStore(AUDIO_ASSET_STORE).getAll();
      req.onsuccess = ()=>resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = ()=>reject(req.error || new Error('indexeddb_getall_failed'));
    });
  }

  async function audioAssetClearAll(){
    const db = await openAudioAssetDb();
    return new Promise((resolve,reject)=>{
      const tx = db.transaction(AUDIO_ASSET_STORE, 'readwrite');
      tx.objectStore(AUDIO_ASSET_STORE).clear();
      tx.oncomplete = ()=>resolve(true);
      tx.onerror = ()=>reject(tx.error || new Error('indexeddb_clear_failed'));
    });
  }

  async function clearAudioDbAndAssignments(){
    try{ stopAudioPreview(); }catch{}
    try{ await audioAssetClearAll(); }catch(err){ logLine('audio clear error: ' + (err?.message || err)); }
    if(state.audio){
      state.audio.library = [];
      state.audio.defaultDriverSoundId = '';
    }
    for(const d of getDriversArray()) d.lapSoundAssetId = '';
    if(state.ui) state.ui.audioSelectedId = '';
    saveState();
    await ensureBuiltInDefaultDriverSound();
  }

  async function clearRaceDataOnly(){
    const fresh = defaultState();
    state.personalRecords = fresh.personalRecords;
    state.raceDay = fresh.raceDay;
    state.season = fresh.season;
    state.modes.activeMode = fresh.modes.activeMode;
    state.modes.singleSubmode = fresh.modes.singleSubmode;
    state.modes.single = fresh.modes.single;
    state.modes.team = fresh.modes.team;
    state.modes.loop = fresh.modes.loop;
    state.modes.endurance = fresh.modes.endurance;
    state.session = fresh.session;
    state.loopRuntime = fresh.loopRuntime;
    if(state.ui){
      state.ui.podiumRaceId = '';
      state.ui.freeDrivingEnabled = false;
    }
    state.usb.lastLines = [];
    try{ localStorage.removeItem(PRES_SNAPSHOT_KEY); }catch{}
    saveState();
    await flushExternalAppDataPersist();
  }

  async function clearAllStoredData(){
    try{ stopAudioPreview(); }catch{}
    await clearExternalAppDataStores();
    try{ localStorage.removeItem(LS_KEY); }catch{}
    try{ localStorage.removeItem(LS_UI); }catch{}
    try{ localStorage.removeItem(PRES_SNAPSHOT_KEY); }catch{}
    state = defaultState();
    ensureAutoEntities(state);
    if(typeof ui==='object' && ui){
      ui.logW = 560;
      ui.logCollapsed = (window.innerWidth || 1600) < 900;
    }
    saveState();
    await flushExternalAppDataPersist();
    saveUi();
    try{ await audioAssetClearAll(); }catch(err){ logLine('audio clear error: ' + (err?.message || err)); }
    await ensureBuiltInDefaultDriverSound();
  }

  async function exportAudioDb(){
    const records = await audioAssetGetAll();
    const payload = {
      kind:'zeitnahme_audio_db_v1',
      exportedAt:new Date().toISOString(),
      targetDb:Number(state.audio?.targetDb || -16),
      defaultDriverSoundId:String(state.audio?.defaultDriverSoundId || ''),
      library: JSON.parse(JSON.stringify(getAudioLibrary())),
      driverAssignments: getDriversArray().map(d=>({ id:d.id, name:d.name, lapSoundAssetId:String(d?.lapSoundAssetId || '') })),
      records
    };
    downloadJson('zeitnahme2_audio_db_' + new Date().toISOString().slice(0,10) + '.json', payload);
  }

  async function importAudioDbFile(file){
    const text = await file.text();
    const data = JSON.parse(text);
    if(!data || data.kind!=='zeitnahme_audio_db_v1') throw new Error('audio_db_invalid_file');
    const library = Array.isArray(data.library) ? data.library : [];
    const records = Array.isArray(data.records) ? data.records : [];
    await audioAssetClearAll();
    for(const rec of records){
      if(rec && rec.id && rec.dataUrl) await audioAssetPut(rec);
    }
    state.audio.library = library;
    if(Number.isFinite(Number(data.targetDb))) state.audio.targetDb = clamp(Number(data.targetDb), -30, -6);
    if(typeof data.defaultDriverSoundId==='string') state.audio.defaultDriverSoundId = data.defaultDriverSoundId;
    if(Array.isArray(data.driverAssignments)){
      const byId = new Map(data.driverAssignments.map(x=>[String(x.id||''), String(x.lapSoundAssetId||'')]));
      for(const d of getDriversArray()){
        if(byId.has(String(d.id||''))) d.lapSoundAssetId = byId.get(String(d.id||''));
      }
    }
    ensureAudioSelection();
    saveState();
    await ensureBuiltInDefaultDriverSound();
  }


  function getAudioLibrary(){
    if(!Array.isArray(state.audio.library)) state.audio.library = [];
    return state.audio.library;
  }

  function renderAudioAssetOptionTags(selectedId='', emptyLabel='— Bitte wählen —'){
    const sel = String(selectedId || '');
    const list = getAudioLibrary().slice().sort((a,b)=> String(a?.name||'').localeCompare(String(b?.name||''), 'de', { sensitivity:'base' }));
    const opts = [`<option value="">${esc(emptyLabel)}</option>`];
    for(const item of list){
      if(!item || !item.id) continue;
      const id = String(item.id);
      const name = item.name || id;
      const cat = item.category ? ` (${item.category})` : '';
      opts.push(`<option value="${esc(id)}" ${sel===id?'selected':''}>${esc(name + cat)}</option>`);
    }
    return opts.join('');
  }

  function getAudioAssetMeta(id){
    return getAudioLibrary().find(x=>x.id===id) || null;
  }

  function ensureAudioSelection(){
    const list = getAudioLibrary();
    if(state.ui.audioSelectedId && list.some(x=>x.id===state.ui.audioSelectedId)) return;
    state.ui.audioSelectedId = list[0]?.id || '';
  }

  function formatDb(v){
    if(v==null || !Number.isFinite(v)) return '—';
    return (Math.round(v*10)/10).toFixed(1) + ' dB';
  }

  function formatSec(v){
    if(v==null || !Number.isFinite(v)) return '—';
    return (Math.round(v*100)/100).toFixed(2) + ' s';
  }

  function fileToDataUrl(file){
    return new Promise((resolve,reject)=>{
      const r = new FileReader();
      r.onerror = ()=>reject(new Error('file_read_failed'));
      r.onload = ()=>resolve(String(r.result||''));
      r.readAsDataURL(file);
    });
  }

  async function dataUrlToAudioBuffer(dataUrl){
    const ctx = getAudioContext();
    if(!ctx) throw new Error('audio_context_not_supported');
    const res = await fetch(dataUrl);
    const arr = await res.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arr.slice(0));
    return decoded;
  }

  function analyzeAudioBuffer(buf){
    const channels = buf.numberOfChannels || 1;
    const len = buf.length || 0;
    let peak = 0;
    let sumSq = 0;
    const points = 64;
    const step = Math.max(1, Math.floor(len / points));
    const waveform = [];
    for(let i=0;i<len;i++){
      let sample = 0;
      for(let c=0;c<channels;c++) sample += Math.abs(buf.getChannelData(c)[i] || 0);
      sample /= channels;
      if(sample>peak) peak = sample;
      sumSq += sample*sample;
    }
    for(let p=0;p<points;p++){
      const start = p*step;
      const end = Math.min(len, start+step);
      let localPeak = 0;
      for(let i=start;i<end;i++){
        let sample = 0;
        for(let c=0;c<channels;c++) sample += Math.abs(buf.getChannelData(c)[i] || 0);
        sample /= channels;
        if(sample>localPeak) localPeak = sample;
      }
      waveform.push(Math.max(0.02, Math.min(1, localPeak || 0)));
    }
    const rms = len ? Math.sqrt(sumSq / len) : 0;
    const rmsDb = rms>0 ? 20*Math.log10(rms) : -100;
    const peakDb = peak>0 ? 20*Math.log10(peak) : -100;
    return {
      durationSec: buf.duration || 0,
      sampleRate: buf.sampleRate || 0,
      channels,
      peak,
      peakDb,
      rms,
      rmsDb,
      waveform
    };
  }

  function calcRecommendedGainDb(meta, targetDb=null){
    const tDb = Number.isFinite(targetDb) ? targetDb : Number(state.audio.targetDb || -16);
    const rmsDb = Number(meta?.rmsDb);
    const peakDb = Number(meta?.peakDb);
    if(!Number.isFinite(rmsDb)) return 0;
    let gainDb = tDb - rmsDb;
    if(Number.isFinite(peakDb) && peakDb + gainDb > -1) gainDb = -1 - peakDb;
    return Math.max(-24, Math.min(24, gainDb));
  }

  function gainDbToLinear(db){
    return Math.pow(10, (Number(db)||0)/20);
  }

  function stopAudioPreview(){
    try{ if(_audioPreviewSource) _audioPreviewSource.stop(); }catch{}
    try{ if(_audioPreviewSource) _audioPreviewSource.disconnect(); }catch{}
    try{ if(_audioPreviewGain) _audioPreviewGain.disconnect(); }catch{}
    _audioPreviewSource = null;
    _audioPreviewGain = null;
  }

  async function previewAudioAsset(meta){
    if(!meta) return;
    const rec = await audioAssetGet(meta.id);
    if(!rec?.dataUrl) throw new Error('audio_asset_missing');
    const ctx = getAudioContext();
    if(!ctx) throw new Error('audio_context_not_supported');
    if(ctx.state === 'suspended') await ctx.resume();
    stopAudioPreview();
    const buf = await dataUrlToAudioBuffer(rec.dataUrl);
    const trimStart = Math.max(0, Number(meta.trimStartMs||0))/1000;
    const trimEnd = Math.max(0, Number(meta.trimEndMs||0))/1000;
    const safeEnd = Math.max(trimStart, (buf.duration||0) - trimEnd);
    const dur = Math.max(0.05, safeEnd - trimStart);
    const gainDb = Number(meta.gainDb || 0);
    const fadeIn = Math.max(0, Number(meta.fadeInMs||0))/1000;
    const fadeOut = Math.max(0, Number(meta.fadeOutMs||0))/1000;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    const baseGain = gainDbToLinear(gainDb);
    const startAt = ctx.currentTime + 0.02;
    gain.gain.setValueAtTime(0, startAt);
    if(fadeIn>0) gain.gain.linearRampToValueAtTime(baseGain, startAt + fadeIn);
    else gain.gain.setValueAtTime(baseGain, startAt + 0.01);
    const fadeOutStart = Math.max(startAt + 0.02, startAt + dur - fadeOut);
    if(fadeOut>0){
      gain.gain.setValueAtTime(baseGain, fadeOutStart);
      gain.gain.linearRampToValueAtTime(0.0001, startAt + dur);
    }
    src.connect(gain);
    gain.connect(ctx.destination);
    src.onended = ()=>{
      if(_audioPreviewSource===src){ _audioPreviewSource = null; _audioPreviewGain = null; }
    };
    src.start(startAt, trimStart, dur);
    _audioPreviewSource = src;
    _audioPreviewGain = gain;
  }

  async function createOrReplaceAudioAsset(file, existingId=''){
    const dataUrl = await fileToDataUrl(file);
    const buf = await dataUrlToAudioBuffer(dataUrl);
    const analyzed = analyzeAudioBuffer(buf);
    const id = existingId || uid('audio');
    await audioAssetPut({
      id,
      name:file.name,
      type:file.type || 'audio/*',
      size:file.size || 0,
      updatedAt:now(),
      dataUrl
    });
    const old = getAudioAssetMeta(id) || {};
    const meta = {
      id,
      name: old.name || file.name.replace(/\.[^.]+$/,''),
      category: old.category || 'Ansage',
      mime: file.type || 'audio/*',
      sizeBytes: file.size || 0,
      durationSec: analyzed.durationSec,
      sampleRate: analyzed.sampleRate,
      channels: analyzed.channels,
      peak: analyzed.peak,
      peakDb: analyzed.peakDb,
      rms: analyzed.rms,
      rmsDb: analyzed.rmsDb,
      waveform: analyzed.waveform,
      targetDb: Number.isFinite(old.targetDb) ? old.targetDb : Number(state.audio.targetDb || -16),
      gainDb: Number.isFinite(old.gainDb) ? old.gainDb : calcRecommendedGainDb({...old, ...analyzed}, Number(state.audio.targetDb || -16)),
      trimStartMs: Number(old.trimStartMs||0),
      trimEndMs: Number(old.trimEndMs||0),
      fadeInMs: Number(old.fadeInMs||0),
      fadeOutMs: Number(old.fadeOutMs||0),
      updatedAt: now()
    };
    const list = getAudioLibrary();
    const idx = list.findIndex(x=>x.id===id);
    if(idx>=0) list[idx] = meta; else list.unshift(meta);
    state.ui.audioSelectedId = id;
    saveState();
    return meta;
  }

  async function reanalyzeAudioAsset(id){
    const meta = getAudioAssetMeta(id);
    if(!meta) throw new Error('audio_meta_missing');
    const rec = await audioAssetGet(id);
    if(!rec?.dataUrl) throw new Error('audio_asset_missing');
    const buf = await dataUrlToAudioBuffer(rec.dataUrl);
    const analyzed = analyzeAudioBuffer(buf);
    Object.assign(meta, analyzed, { updatedAt:now() });
    if(!Number.isFinite(Number(meta.gainDb))) meta.gainDb = calcRecommendedGainDb(meta, Number(meta.targetDb||state.audio.targetDb||-16));
    saveState();
    return meta;
  }

  async function removeAudioAsset(id){
    state.audio.library = getAudioLibrary().filter(x=>x.id!==id);
    if(state.ui.audioSelectedId===id) state.ui.audioSelectedId = state.audio.library[0]?.id || '';
    saveState();
    await audioAssetDelete(id);
  }

  function getFilteredAudioLibrary(){
    const q = String(state.ui.audioSearch||'').trim().toLowerCase();
    const cat = String(state.ui.audioFilterCategory||'').trim();
    return getAudioLibrary().filter(item=>{
      if(cat && item.category!==cat) return false;
      if(q){
        const hay = [item.name, item.category, item.mime].join(' ').toLowerCase();
        if(!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderWaveformBars(points){
    const arr = Array.isArray(points) ? points : [];
    if(!arr.length) return '<div class="muted small">Noch keine Analyse.</div>';
    return `<div class="audio-wave">${arr.map(v=>`<span style="height:${Math.max(6, Math.round(v*52))}px"></span>`).join('')}</div>`;
  }

  // -------- Audio --------

  function renderAudio(){
    const el = document.getElementById('pageAudio');
    ensureAudioSelection();
    const voices = ('speechSynthesis' in window) ? speechSynthesis.getVoices() : [];
    const voiceOptions = voices.map(v=>`<option value="${esc(v.voiceURI)}" ${state.audio.voiceUri===v.voiceURI?'selected':''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('');
    const library = getFilteredAudioLibrary();
    const selected = getAudioAssetMeta(state.ui.audioSelectedId);
    const categories = Array.from(new Set(getAudioLibrary().map(x=>String(x.category||'').trim()).filter(Boolean))).sort((a,b)=>a.localeCompare(b,'de'));

    el.innerHTML = `
      <div class="grid2" style="align-items:start;">
        <div class="card">
          <div class="card-h"><h2>Audio</h2></div>
          <div class="card-b">
            <div class="muted">Hier stellst du ein, was bei einer gemessenen Runde angesagt wird.</div>
            <div class="hr"></div>

            <div class="field">
              <label>Audio aktiv</label>
              <select id="audEnabled">
                <option value="true" ${state.audio.enabled?'selected':''}>Ja</option>
                <option value="false" ${!state.audio.enabled?'selected':''}>Nein</option>
              </select>
            </div>

            <div class="field">
              <label>Ansage bei Runde</label>
              <select id="lapMode">
                ${['Aus','Jede Runde','Nur Bestzeit'].map(x=>`<option ${state.audio.lapAnnounceMode===x?'selected':''}>${x}</option>`).join('')}
              </select>
            </div>

            <div class="field">
              <label>Bausteine</label>
              <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayName" ${state.audio.sayName?'checked':''}/> Name (Fahrer oder Auto)</label>
              <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayLapNo" ${state.audio.sayLapNo?'checked':''}/> Rundennummer</label>
              <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayLapTime" ${state.audio.sayLapTime?'checked':''}/> Rundenzeit</label>
            </div>

            <div class="field">
              <label>Dezimalstellen Rundenzeit</label>
              <select id="decimals">
                ${[0,1,2,3].map(n=>`<option value="${n}" ${state.audio.decimals===n?'selected':''}>${n}</option>`).join('')}
              </select>
            </div>

            <div class="hr"></div>

            <div class="field">
              <label>Stimme</label>
              <select id="voiceSel">
                <option value="">(Auto)</option>
                ${voiceOptions}
              </select>
            </div>

            <div class="row">
              <button class="btn btn-primary" id="audSave">Speichern</button>
              <button class="btn" id="audTest">Test</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-h"><h2>Audio Feinheiten</h2></div>
          <div class="card-b">
            <div class="field">
              <label>Rate (Sprechgeschwindigkeit)</label>
              <input class="input" id="rate" type="range" min="0.5" max="2" step="0.01" value="${esc(state.audio.rate)}"/>
            </div>
            <div class="field">
              <label>Pitch (Tonhöhe)</label>
              <input class="input" id="pitch" type="range" min="0" max="2" step="0.01" value="${esc(state.audio.pitch)}"/>
            </div>
            <div class="field">
              <label>Volume (Lautstärke)</label>
              <input class="input" id="volume" type="range" min="0" max="1" step="0.01" value="${esc(state.audio.volume)}"/>
            </div>
            <div class="row">
              <button class="btn btn-primary" id="audSave2">Speichern</button>
            </div>
            <div class="muted">Hinweis: Browser-TTS hängt an System/Browser-Audio.</div>

            <div class="hr"></div>

            <div class="card" style="background:rgba(15,23,42,.35); margin-top:12px;">
              <div class="card-h"><h2>Renn-Ansagen</h2></div>
              <div class="card-b">
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="restAnnouncementsEnabled" ${state.audio.restAnnouncementsEnabled?'checked':''}/> Restzeit-Ansagen aktiv</label>

                <div class="field">
                  <label>Restzeit-Punkte (Sekunden, komma-getrennt)</label>
                  <input class="input mono" id="restAnnouncementTimes" value="${esc((state.audio.restAnnouncementTimes||[]).join(','))}" placeholder="300,180,120,60,30"/>
                </div>

                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayTimeExpired" ${state.audio.sayTimeExpired?'checked':''}/> „Zeit abgelaufen“</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayFinished" ${state.audio.sayFinished?'checked':''}/> „Name im Ziel“</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayRunFinished" ${state.audio.sayRunFinished?'checked':''}/> „Der Lauf ist beendet“</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayPlacements" ${state.audio.sayPlacements?'checked':''}/> Platzierungen ansagen</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayOvertakes" ${state.audio.sayOvertakes?'checked':''}/> Positionswechsel ansagen</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayLappingWarning" ${state.audio.sayLappingWarning?'checked':''}/> Überrundung ankündigen</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayPositionsAtRest" ${state.audio.sayPositionsAtRest?'checked':''}/> Bei Restzeit aktuelle Plätze ansagen</label>
                <div class="field"><label>Überrundung-Vorlauf (Sekunden)</label><input class="input mono" id="lappingWarnSec" type="number" min="1" max="30" step="1" value="${esc(Number(state.audio.lappingWarnSec||3))}"/></div>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayTrackRecordSeason" ${state.audio.sayTrackRecordSeason?'checked':''}/> Saison-Streckenrekord ansagen</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayTrackRecordDay" ${state.audio.sayTrackRecordDay?'checked':''}/> Renntag-Streckenrekord ansagen</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayPersonalBestSeason" ${state.audio.sayPersonalBestSeason?'checked':''}/> Persönliche Bestzeit (Saison) ansagen</label>
                <label class="row" style="gap:10px; margin:6px 0;"><input type="checkbox" id="sayPersonalBestDay" ${state.audio.sayPersonalBestDay?'checked':''}/> Persönliche Bestzeit (Renntag) ansagen</label>

                <div class="muted" style="margin-top:8px;">Beispiel: 300,180,120,60,30 → „Noch 5 Minuten“, „Noch 30“</div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px;">
        <div class="card-h"><h2>Audio-DB</h2></div>
        <div class="card-b">
          <div class="row wrap" style="justify-content:space-between; gap:12px; align-items:flex-end; margin-bottom:12px;">
            <div class="row wrap" style="gap:12px; align-items:flex-end;">
              <div class="field" style="margin:0; min-width:220px;">
                <label>Suchen</label>
                <input class="input" id="audioSearch" value="${esc(state.ui.audioSearch||'')}" placeholder="Name oder Kategorie"/>
              </div>
              <div class="field" style="margin:0; min-width:180px;">
                <label>Kategorie</label>
                <select id="audioCategoryFilter">
                  <option value="">Alle</option>
                  ${categories.map(cat=>`<option value="${esc(cat)}" ${state.ui.audioFilterCategory===cat?'selected':''}>${esc(cat)}</option>`).join('')}
                </select>
              </div>
              <div class="field" style="margin:0; width:160px;">
                <label>Ziel-Lautheit</label>
                <input class="input mono" id="audioGlobalTargetDb" type="number" step="0.5" min="-30" max="-6" value="${esc(state.audio.targetDb)}"/>
              </div>
            </div>
            <div class="row wrap" style="gap:10px;">
              <input type="file" id="audioFileAdd" accept="audio/*" multiple style="display:none" />
              <input type="file" id="audioImportFile" accept="application/json" style="display:none" />
              <button class="btn btn-primary" id="audioAddBtn" type="button">Sounds hinzufügen</button>
              <button class="btn" id="audioExportBtn" type="button">Audio-DB exportieren</button>
              <button class="btn" id="audioImportBtn" type="button">Audio-DB importieren</button>
              <button class="btn" id="audioAlignAll" type="button">Alle angleichen</button>
              <button class="btn" id="audioStopPreview" type="button">Stop</button>
            </div>
          </div>

          <div class="audio-db-grid">
            <div class="audio-list-panel">
              <div class="muted small" style="margin-bottom:8px;">${library.length} Sound${library.length===1?'':'s'} im Filter</div>
              <div class="audio-list">
                ${library.length ? library.map(item=>`
                  <button class="audio-item ${selected?.id===item.id?'active':''}" type="button" data-audio-select="${item.id}">
                    <div class="audio-item-top">
                      <strong>${esc(item.name || 'Ohne Namen')}</strong>
                      <span class="badge">${esc(item.category || '—')}</span>
                    </div>
                    <div class="audio-item-sub mono">${formatSec(item.durationSec)} · RMS ${formatDb(item.rmsDb)} · Gain ${formatDb(item.gainDb)}</div>
                  </button>`).join('') : `<div class="muted">Noch keine Sounds hinterlegt.</div>`}
              </div>
            </div>

            <div class="audio-editor-panel">
              ${selected ? `
                <div class="grid2" style="align-items:start;">
                  <div>
                    <div class="field">
                      <label>Name</label>
                      <input class="input" id="audioName" value="${esc(selected.name||'')}"/>
                    </div>
                    <div class="field">
                      <label>Kategorie</label>
                      <input class="input" id="audioCategory" list="audioCategoryList" value="${esc(selected.category||'')}" placeholder="Start, Ziel, Ansage, Fehler …"/>
                      <datalist id="audioCategoryList">${categories.map(cat=>`<option value="${esc(cat)}"></option>`).join('')}</datalist>
                    </div>
                    <div class="audio-meta-grid">
                      <div class="miniStat"><span>Dauer</span><strong>${formatSec(selected.durationSec)}</strong></div>
                      <div class="miniStat"><span>Peak</span><strong>${formatDb(selected.peakDb)}</strong></div>
                      <div class="miniStat"><span>RMS</span><strong>${formatDb(selected.rmsDb)}</strong></div>
                      <div class="miniStat"><span>Datei</span><strong>${esc(selected.mime||'audio/*')}</strong></div>
                    </div>
                    <div class="field">
                      <label>Waveform</label>
                      ${renderWaveformBars(selected.waveform)}
                    </div>
                    <div class="row wrap" style="gap:10px; margin-top:12px;">
                      <input type="file" id="audioReplaceFile" accept="audio/*" style="display:none" />
                      <button class="btn" id="audioReplaceBtn" type="button">Datei ersetzen</button>
                      <button class="btn btn-primary" id="audioPreviewBtn" type="button">Vorschau</button>
                      <button class="btn" id="audioAnalyzeBtn" type="button">Neu analysieren</button>
                      <button class="btn btn-danger" id="audioDeleteBtn" type="button">Löschen</button>
                    </div>
                  </div>

                  <div>
                    <div class="field">
                      <label>Gain / Lautstärke (${formatDb(selected.gainDb)})</label>
                      <input class="input" id="audioGainDb" type="range" min="-24" max="24" step="0.1" value="${esc(Number(selected.gainDb||0))}" />
                    </div>
                    <div class="field">
                      <label>Ziel-Lautheit pro Sound</label>
                      <input class="input mono" id="audioTargetDb" type="number" step="0.5" min="-30" max="-6" value="${esc(Number.isFinite(selected.targetDb)?selected.targetDb:state.audio.targetDb)}" />
                    </div>
                    <div class="row wrap" style="gap:10px; margin-bottom:10px;">
                      <button class="btn" id="audioAutoGainBtn" type="button">Auf Zielwert angleichen</button>
                      <button class="btn" id="audioNormalizeBtn" type="button">Normalisieren</button>
                    </div>
                    <div class="field">
                      <label>Start-Cut (ms)</label>
                      <input class="input mono" id="audioTrimStartMs" type="number" min="0" step="10" value="${esc(Number(selected.trimStartMs||0))}" />
                    </div>
                    <div class="field">
                      <label>End-Cut (ms)</label>
                      <input class="input mono" id="audioTrimEndMs" type="number" min="0" step="10" value="${esc(Number(selected.trimEndMs||0))}" />
                    </div>
                    <div class="field">
                      <label>Fade-In (ms)</label>
                      <input class="input mono" id="audioFadeInMs" type="number" min="0" step="10" value="${esc(Number(selected.fadeInMs||0))}" />
                    </div>
                    <div class="field">
                      <label>Fade-Out (ms)</label>
                      <input class="input mono" id="audioFadeOutMs" type="number" min="0" step="10" value="${esc(Number(selected.fadeOutMs||0))}" />
                    </div>
                    <div class="row wrap" style="gap:10px; margin-top:12px;">
                      <button class="btn btn-primary" id="audioSaveMetaBtn" type="button">Sound speichern</button>
                    </div>
                  </div>
                </div>
              ` : `<div class="muted">Wähle links einen Sound aus oder lade neue Sounds hoch.</div>`}
            </div>
          </div>
          <div class="muted small" style="margin-top:12px;">Die Audiodateien liegen lokal im Browser in IndexedDB. Dadurch bleiben sie erhalten, ohne dein normales LocalStorage zu sprengen. Zusätzlich wird beim ersten Start automatisch ein eingebauter Standardsound angelegt und als Fallback genutzt, falls weder Fahrer- noch Standard-Sound gewählt wurde.</div>
        </div>
      </div>
    `;

    const saveAudio = ()=>{
      state.audio.enabled = (el.querySelector('#audEnabled').value==='true');
      state.audio.lapAnnounceMode = el.querySelector('#lapMode').value;
      state.audio.sayName = el.querySelector('#sayName').checked;
      state.audio.sayLapNo = el.querySelector('#sayLapNo').checked;
      state.audio.sayLapTime = el.querySelector('#sayLapTime').checked;
      const dec = parseInt(el.querySelector('#decimals').value,10);
      state.audio.decimals = Number.isFinite(dec) ? Math.max(0, Math.min(3, dec)) : 3;
      state.audio.voiceUri = el.querySelector('#voiceSel').value;
      state.audio.rate = parseFloat(el.querySelector('#rate').value);
      state.audio.pitch = parseFloat(el.querySelector('#pitch').value);
      state.audio.volume = parseFloat(el.querySelector('#volume').value);
      state.audio.targetDb = clamp(parseFloat(el.querySelector('#audioGlobalTargetDb').value), -30, -6);
      state.audio.defaultDriverSoundId = el.querySelector('#audioDefaultDriverSoundId')?.value || '';

      state.audio.restAnnouncementsEnabled = !!el.querySelector('#restAnnouncementsEnabled').checked;
      state.audio.restAnnouncementTimes = String(el.querySelector('#restAnnouncementTimes').value || '')
        .split(',')
        .map(x=>parseInt(String(x).trim(),10))
        .filter(x=>Number.isFinite(x) && x>0)
        .sort((a,b)=>b-a);
      if(!state.audio.restAnnouncementTimes.length) state.audio.restAnnouncementTimes = [300,180,120,60,30];
      state.audio.sayTimeExpired = !!el.querySelector('#sayTimeExpired').checked;
      state.audio.sayFinished = !!el.querySelector('#sayFinished').checked;
      state.audio.sayRunFinished = !!el.querySelector('#sayRunFinished').checked;
      state.audio.sayPlacements = !!el.querySelector('#sayPlacements').checked;
      state.audio.sayOvertakes = !!el.querySelector('#sayOvertakes').checked;
      state.audio.sayLappingWarning = !!el.querySelector('#sayLappingWarning').checked;
      state.audio.sayPositionsAtRest = !!el.querySelector('#sayPositionsAtRest').checked;
      state.audio.lappingWarnSec = Math.max(1, Math.min(30, parseInt(el.querySelector('#lappingWarnSec').value,10) || 3));
      state.audio.sayTrackRecordSeason = !!el.querySelector('#sayTrackRecordSeason').checked;
      state.audio.sayTrackRecordDay = !!el.querySelector('#sayTrackRecordDay').checked;
      state.audio.sayPersonalBestSeason = !!el.querySelector('#sayPersonalBestSeason').checked;
      state.audio.sayPersonalBestDay = !!el.querySelector('#sayPersonalBestDay').checked;
      saveState();
      toast('Audio','Gespeichert.','ok');
    };

    const persistSelectedMeta = ()=>{
      const meta = getAudioAssetMeta(state.ui.audioSelectedId);
      if(!meta) return null;
      const nameEl = el.querySelector('#audioName');
      const categoryEl = el.querySelector('#audioCategory');
      const gainEl = el.querySelector('#audioGainDb');
      const targetEl = el.querySelector('#audioTargetDb');
      const trimStartEl = el.querySelector('#audioTrimStartMs');
      const trimEndEl = el.querySelector('#audioTrimEndMs');
      const fadeInEl = el.querySelector('#audioFadeInMs');
      const fadeOutEl = el.querySelector('#audioFadeOutMs');
      meta.name = String(nameEl?.value || meta.name || '').trim() || 'Sound';
      meta.category = String(categoryEl?.value || meta.category || '').trim() || 'Ansage';
      meta.gainDb = clamp(parseFloat(gainEl?.value), -24, 24);
      meta.targetDb = clamp(parseFloat(targetEl?.value), -30, -6);
      meta.trimStartMs = Math.max(0, parseInt(trimStartEl?.value||0,10) || 0);
      meta.trimEndMs = Math.max(0, parseInt(trimEndEl?.value||0,10) || 0);
      meta.fadeInMs = Math.max(0, parseInt(fadeInEl?.value||0,10) || 0);
      meta.fadeOutMs = Math.max(0, parseInt(fadeOutEl?.value||0,10) || 0);
      meta.updatedAt = now();
      saveState();
      return meta;
    };

    el.querySelector('#audSave').onclick=saveAudio;
    el.querySelector('#audSave2').onclick=saveAudio;
    el.querySelector('#audTest').onclick=()=>{ saveAudio(); speak('Test. Audio Ausgabe funktioniert.'); toast('Audio','Test-Ansage gestartet.','ok'); };

    const searchEl = el.querySelector('#audioSearch');
    if(searchEl) searchEl.oninput = ()=>{ state.ui.audioSearch = searchEl.value || ''; renderAudio(); };
    const filterEl = el.querySelector('#audioCategoryFilter');
    if(filterEl) filterEl.onchange = ()=>{ state.ui.audioFilterCategory = filterEl.value || ''; renderAudio(); };
    const globalTargetEl = el.querySelector('#audioGlobalTargetDb');
    if(globalTargetEl) globalTargetEl.onchange = ()=>{ state.audio.targetDb = clamp(parseFloat(globalTargetEl.value), -30, -6); saveState(); };
    const defaultDriverSoundEl = el.querySelector('#audioDefaultDriverSoundId');
    if(defaultDriverSoundEl) defaultDriverSoundEl.onchange = ()=>{ state.audio.defaultDriverSoundId = defaultDriverSoundEl.value || ''; saveState(); };

    const addInput = el.querySelector('#audioFileAdd');
    el.querySelector('#audioAddBtn').onclick = ()=> addInput?.click();
    if(addInput) addInput.onchange = async ()=>{
      const files = Array.from(addInput.files || []);
      if(!files.length) return;
      try{
        for(const file of files) await createOrReplaceAudioAsset(file);
        toast('Audio-DB', files.length + ' Sound(s) importiert.','ok');
        renderAudio();
      }catch(err){
        toast('Audio-DB','Import fehlgeschlagen.','err');
        logLine('audio import error: ' + (err?.message || err));
      }finally{ addInput.value=''; }
    };

    el.querySelectorAll('[data-audio-select]').forEach(btn=> btn.onclick = ()=>{ state.ui.audioSelectedId = btn.getAttribute('data-audio-select') || ''; saveState(); renderAudio(); });
    el.querySelector('#audioStopPreview')?.addEventListener('click', ()=> stopAudioPreview());
    el.querySelector('#audioAlignAll')?.addEventListener('click', ()=>{
      for(const meta of getAudioLibrary()){
        const target = Number.isFinite(meta.targetDb) ? meta.targetDb : Number(state.audio.targetDb || -16);
        meta.gainDb = calcRecommendedGainDb(meta, target);
        meta.updatedAt = now();
      }
      saveState();
      toast('Audio-DB','Alle Sounds angeglichen.','ok');
      renderAudio();
    });

    if(selected){
      el.querySelector('#audioSaveMetaBtn')?.addEventListener('click', ()=>{ persistSelectedMeta(); toast('Audio-DB','Sound gespeichert.','ok'); renderAudio(); });
      el.querySelector('#audioPreviewBtn')?.addEventListener('click', async ()=>{
        try{ const meta = persistSelectedMeta(); await previewAudioAsset(meta); }
        catch(err){ toast('Audio-DB','Vorschau fehlgeschlagen.','err'); logLine('audio preview error: ' + (err?.message || err)); }
      });
      el.querySelector('#audioAnalyzeBtn')?.addEventListener('click', async ()=>{
        try{ persistSelectedMeta(); await reanalyzeAudioAsset(selected.id); toast('Audio-DB','Analyse aktualisiert.','ok'); renderAudio(); }
        catch(err){ toast('Audio-DB','Analyse fehlgeschlagen.','err'); logLine('audio analyze error: ' + (err?.message || err)); }
      });
      el.querySelector('#audioDeleteBtn')?.addEventListener('click', async ()=>{
        try{ stopAudioPreview(); await removeAudioAsset(selected.id); toast('Audio-DB','Sound gelöscht.','ok'); renderAudio(); }
        catch(err){ toast('Audio-DB','Löschen fehlgeschlagen.','err'); logLine('audio delete error: ' + (err?.message || err)); }
      });
      const replaceInput = el.querySelector('#audioReplaceFile');
      el.querySelector('#audioReplaceBtn')?.addEventListener('click', ()=> replaceInput?.click());
      if(replaceInput) replaceInput.onchange = async ()=>{
        const file = replaceInput.files?.[0];
        if(!file) return;
        try{ persistSelectedMeta(); await createOrReplaceAudioAsset(file, selected.id); toast('Audio-DB','Datei ersetzt.','ok'); renderAudio(); }
        catch(err){ toast('Audio-DB','Ersetzen fehlgeschlagen.','err'); logLine('audio replace error: ' + (err?.message || err)); }
        finally{ replaceInput.value=''; }
      };
      el.querySelector('#audioAutoGainBtn')?.addEventListener('click', ()=>{
        const meta = persistSelectedMeta();
        if(!meta) return;
        meta.gainDb = calcRecommendedGainDb(meta, Number(meta.targetDb || state.audio.targetDb || -16));
        saveState();
        renderAudio();
      });
      el.querySelector('#audioNormalizeBtn')?.addEventListener('click', ()=>{
        const meta = persistSelectedMeta();
        if(!meta) return;
        const peakDb = Number(meta.peakDb);
        meta.gainDb = Number.isFinite(peakDb) ? Math.max(-24, Math.min(24, -1 - peakDb)) : 0;
        saveState();
        renderAudio();
      });
      ['#audioName','#audioCategory','#audioGainDb','#audioTargetDb','#audioTrimStartMs','#audioTrimEndMs','#audioFadeInMs','#audioFadeOutMs'].forEach(sel=>{
        const node = el.querySelector(sel);
        if(node) node.addEventListener('change', persistSelectedMeta);
      });
    }
  }

  // -------- Einstellungen --------
  function renderEinstellungen(){
    const el = document.getElementById('pageEinstellungen');
    function readSettingsForm(){
      return {
        appName: el.querySelector('#appName').value.trim() || 'Zeitnahme 2.0',
        language: String(el.querySelector('#appLanguage')?.value || 'de').trim() === 'en' ? 'en' : 'de',
        allowIdleReads: false,
        discordWebhook: String(el.querySelector('#webhook')?.value || '').trim(),
        discordAutoSend: !!el.querySelector('#discordAutoSend')?.checked,
        discordUseThread: !!el.querySelector('#discordUseThread')?.checked,
        discordThreadName: String(el.querySelector('#discordThreadName')?.value || '').trim(),
        discordRaceDayWebhook: String(el.querySelector('#raceDayWebhook')?.value || '').trim(),
        discordSeasonWebhook: String(el.querySelector('#seasonWebhook')?.value || '').trim(),
        discordRaceDayUseThread: !!el.querySelector('#discordRaceDayUseThread')?.checked,
        discordSeasonUseThread: !!el.querySelector('#discordSeasonUseThread')?.checked,
        discordRaceDayThreadName: String(el.querySelector('#discordRaceDayThreadName')?.value || '').trim(),
        discordSeasonThreadName: String(el.querySelector('#discordSeasonThreadName')?.value || '').trim(),
        scaleDenominator: Math.max(1, parseInt(el.querySelector('#setScaleDenominator').value,10)||50),
        lapTimeSource:'mrc'
      };
    }

    function commitSettingsDraft(draft, {notify=false, log=false} = {}){
      const languageChanged = String(state.settings?.language || 'de') !== String(draft?.language || 'de');
      Object.assign(state.settings, draft);
      saveState();
      renderTopMenu();
      renderHeader();
      if(languageChanged) renderAll();
      if(notify) toast(t('tab.pageEinstellungen'), t('settings.saved'),'ok');
      if(log) logLine(t('settings.saved_log'));
      return draft;
    }

    function saveSettingsFromForm(opts={}){
      return commitSettingsDraft(readSettingsForm(), opts);
    }

    el.innerHTML = `
      <div class="settings-page">
        <div class="card settings-card settings-overview">
          <div class="card-b settings-overview-b">
            <div>
              <div class="settings-kicker">Einstellungen</div>
              <div class="settings-overview-title">Betrieb, Integrationen und Datenpflege</div>
              <div class="muted settings-overview-copy">Der Tab ist in System, Discord und Datenaustausch getrennt, damit typische Anpassungen schneller auffindbar bleiben.</div>
            </div>
            <div class="settings-overview-meta">
              <span class="pill">Build ${BUILD}</span>
              <span class="pill">MRC only</span>
              <span class="pill">Local first</span>
            </div>
          </div>
        </div>

      <div class="settings-grid">
        <div class="settings-stack">
          <div class="settings-sectionlabel">Betrieb</div>
          <div class="settings-mini-grid">
            <div class="card settings-card" style="margin-bottom:12px">
            <div class="card-h"><h2>${t('settings.general')}</h2></div>
            <div class="card-b">
              <div class="field" style="margin-bottom:0">
                <label>${t('settings.header_name')}</label>
                <input class="input" id="appName" value="${esc(state.settings.appName)}"/>
              </div>
              <div class="field" style="margin-top:12px; margin-bottom:0">
                <label>${t('settings.language')}</label>
                <select id="appLanguage">
                  <option value="de" ${getUiLanguage()==='de'?'selected':''}>${t('settings.language_de')}</option>
                  <option value="en" ${getUiLanguage()==='en'?'selected':''}>${t('settings.language_en')}</option>
                </select>
              </div>
              <div class="settings-actionbar">
                <div class="muted settings-action-note">Speichern uebernimmt alle editierbaren Felder in diesem Tab, inklusive Discord- und Massstab-Werten.</div>
                <button class="btn btn-primary" id="saveSettings">${t('settings.save')}</button>
              </div>
            </div>
          </div>

            <div class="card settings-card" style="margin-bottom:12px">
            <div class="card-h"><h2>Zeitmessung</h2></div>
            <div class="card-b">
              <div class="settings-tag">Timing</div>
              <div class="field">
                <label>Quelle für Rundenzeit</label>
                <div class="pill" id="setLapTimeSource" data-fixed="mrc">Nur MRC-Rundenzeit</div>
                <div class="muted">Browser-/HTML-Zeit ist vollständig deaktiviert. Ohne gültige MRC-Zeitbasis startet kein Rennen.</div>
              </div>
            </div>
          </div>

            <div class="card settings-card" style="margin-bottom:12px">
            <div class="card-h"><h2>Maßstab</h2></div>
            <div class="card-b">
              <div class="field">
                <label>Maßstab</label>
                <div class="row" style="gap:8px; align-items:center">
                  <span class="muted">1 zu</span>
                  <input class="input settings-inline-input" id="setScaleDenominator" type="number" min="1" step="1" value="${esc(getScaleDenominator())}"/>
                </div>
                <div class="muted">Standard: 50</div>
              </div>
            </div>
          </div>
          </div>

          <div class="settings-sectionlabel">Sicherung und Reset</div>
          <div class="card settings-card" id="settingsBackupCard" style="margin-bottom:12px">
            <div class="card-h"><h2>Backup / Restore</h2></div>
            <div class="card-b">
              <div class="muted">Backup exportiert alles als JSON. Restore importiert JSON und überschreibt den aktuellen Stand.</div>
              <div class="settings-actions">
                <button class="btn" id="btnBackup">Backup exportieren</button>
                <label class="btn" style="cursor:pointer;">
                  Restore importieren
                  <input id="fileRestore" type="file" accept="application/json" style="display:none"/>
                </label>
              </div>
            </div>
          </div>

          <div class="card settings-card">
            <div class="card-h"><h2>Daten zurücksetzen</h2></div>
            <div class="card-b">
              <div class="muted">Löscht Browserdaten dieser Zeitnahme direkt in der App — ohne AppData-Gefummel.</div>
              <div class="settings-actions">
                <button class="btn btn-danger" id="btnResetAll" type="button">Alles löschen</button>
                <button class="btn" id="btnResetRaceData" type="button">Nur Renndaten löschen</button>
                <button class="btn" id="btnResetAudioDb" type="button">Nur Audio-DB löschen</button>
              </div>
              <div class="muted small" style="margin-top:8px">Alles löschen: Stammdaten, Sessions, Einstellungen und Audio. Renndaten löschen: Sessions, Saison, Renntag, Rekorde und freie Reads. Audio-DB löschen: importierte Sounds und Fahrersound-Zuordnung. Der eingebaute Standardsound wird automatisch wieder angelegt.</div>
            </div>
          </div>
        </div>

        <div class="settings-stack">
          <div class="settings-sectionlabel">Integrationen und Austausch</div>
          <div class="card settings-card" style="margin-bottom:12px">
            <div class="card-h"><h2>Discord</h2></div>
            <div class="card-b">
              <div class="settings-discord-intro">
                <div class="settings-note">
                  <div>Discord-Ausgaben sind nach Session, Renntag und Saison getrennt.</div>
                  <div class="muted small">So bleibt klar, welcher Webhook und welcher Titel fuer welchen Versand genutzt wird.</div>
                </div>
                <div class="settings-discord-badges">
                  <span class="pill">Session</span>
                  <span class="pill">Renntag</span>
                  <span class="pill">Saison</span>
                </div>
              </div>
              <div class="settings-discord-grid">
                <div class="settings-subcard settings-discord-card">
                  <div class="settings-tag">Session</div>
                  <h3>Session-Webhook</h3>
              <div class="field">
                <label>Session Webhook</label>
                <input class="input" id="webhook" value="${esc(state.settings.discordWebhook)}" placeholder="https://..."/>
                <div class="muted small">Für die bestehende automatische Session-Grafik nach Rennende.</div>
              </div>
              <div class="field">
                <label class="row" style="gap:8px; align-items:center">
                  <input type="checkbox" id="discordAutoSend" ${state.settings.discordAutoSend?'checked':''}/>
                  <span>Nach Session-Ende automatisch an Discord senden</span>
                </label>
                <div class="muted">Sendet nach Rennende automatisch eine Grafik mit Podium bzw. Bestzeiten an den Session-Webhook.</div>
              </div>
              <div class="field">
                <label class="row" style="gap:8px; align-items:center">
                  <input type="checkbox" id="discordUseThread" ${state.settings.discordUseThread?'checked':''}/>
                  <span>Session optional als Thread senden (für Forum-Kanäle)</span>
                </label>
              </div>
              <div class="field">
                <label>Session Thread-Name</label>
                <input class="input" id="discordThreadName" value="${esc(state.settings.discordThreadName || '{track}, {date} {time}') }" placeholder="{track}, {date} {time}"/>
                <div class="muted">Platzhalter: {track}, {mode}, {session}, {type}, {season}, {renntag}, {date}, {time}</div>
              </div>
                </div>
                <div class="settings-subcard settings-discord-card">
                  <div class="settings-tag">Renntag</div>
                  <h3>Renntag-Webhook</h3>
              <div class="field">
                <label>Renntag Webhook</label>
                <input class="input" id="raceDayWebhook" value="${esc(state.settings.discordRaceDayWebhook || '')}" placeholder="https://..."/>
                <div class="muted small">Sendet pro Strecke alle Fahrer mit ihrer besten Runde des Renntags.</div>
              </div>
              <div class="field">
                <label class="row" style="gap:8px; align-items:center">
                  <input type="checkbox" id="discordRaceDayUseThread" ${state.settings.discordRaceDayUseThread?'checked':''}/>
                  <span>Renntag als Thread / Forum-Beitrag senden</span>
                </label>
              </div>
              <div class="field">
                <label>Renntag Thread-/Post-Titel</label>
                <input class="input" id="discordRaceDayThreadName" value="${esc(state.settings.discordRaceDayThreadName || '{type} • {date}') }" placeholder="{type} • {date}"/>
                <div class="muted">Platzhalter: {track}, {type}, {renntag}, {date}, {time}</div>
              </div>
              <div class="settings-actions">
                <button class="btn" id="btnRaceDayWebhookTest" type="button">Renntag-Test senden</button>
              </div>
                </div>
                <div class="settings-subcard settings-discord-card">
                  <div class="settings-tag">Saison</div>
                  <h3>Saison-Webhook</h3>
              <div class="field">
                <label>Saison Webhook</label>
                <input class="input" id="seasonWebhook" value="${esc(state.settings.discordSeasonWebhook || '')}" placeholder="https://..."/>
                <div class="muted small">Sendet die Saison-Gesamtwertung plus Awards und Statistik.</div>
              </div>
              <div class="field">
                <label class="row" style="gap:8px; align-items:center">
                  <input type="checkbox" id="discordSeasonUseThread" ${state.settings.discordSeasonUseThread?'checked':''}/>
                  <span>Saison als Thread / Forum-Beitrag senden</span>
                </label>
              </div>
              <div class="field">
                <label>Saison Thread-/Post-Titel</label>
                <input class="input" id="discordSeasonThreadName" value="${esc(state.settings.discordSeasonThreadName || '{type} • {season}') }" placeholder="{type} • {season}"/>
                <div class="muted">Platzhalter: {type}, {season}, {date}, {time}</div>
              </div>
              <div class="settings-actions">
                <button class="btn" id="btnSeasonWebhookTest" type="button">Saison-Test senden</button>
              </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card settings-card" id="settingsDataExchangeCard">
            <div class="card-h"><h2>Import / Export</h2></div>
            <div class="card-b">
              <div class="settings-actions">
                <button class="btn" id="btnExportMaster">Stammdaten exportieren</button>
                <button class="btn" id="btnExportAll">Alles exportieren</button>
              </div>
              <div class="hr"></div>
              <div class="row" style="gap:10px; flex-wrap:wrap; align-items:center">
                <input class="input settings-file-input" type="file" id="importFile" accept="application/json"/>
                <label class="row" style="gap:8px"><input type="checkbox" id="importAllowDupNames"/> Duplikate nach Name erlauben</label>
                <button class="btn" id="btnImportMaster">Stammdaten importieren (kein Überschreiben)</button>
              </div>
              <div class="muted" style="margin-top:8px">Hinweis: Import überschreibt nichts. Fahrer/Autos mit gleicher ID oder gleicher Chip-ID werden übersprungen. (Chip-ID = chipId/chipCode)</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    `;

    const backupCard = el.querySelector('#settingsBackupCard .card-b');
    if(backupCard){
      backupCard.innerHTML = `
        <div class="settings-subcards settings-subcards-compact">
          <div class="settings-subcard">
            <div class="settings-tag">App-Backup</div>
            <h3>Komplette App-Daten sichern</h3>
            <div class="muted settings-subcopy">Exportiert Sessions, Renntag, Saison, Stammdaten und Einstellungen als JSON. Die Audio-DB wird separat im Audio-Tab exportiert.</div>
            <div class="settings-actions">
              <button class="btn" id="btnBackup">App-Backup exportieren</button>
            </div>
          </div>
          <div class="settings-subcard">
            <div class="settings-tag">Restore</div>
            <h3>Backup zurueckspielen</h3>
            <div class="muted settings-subcopy">Akzeptiert aktuelle App-Backups und aeltere rohe State-Backups. Stammdaten- und Audio-Exporte gehoeren nicht hier hinein.</div>
            <div class="settings-actions">
              <label class="btn" style="cursor:pointer;">
                Backup importieren
                <input id="fileRestore" type="file" accept="application/json" style="display:none"/>
              </label>
            </div>
          </div>
        </div>
      `;
    }

    const dataExchangeCard = el.querySelector('#settingsDataExchangeCard .card-b');
    if(dataExchangeCard){
      dataExchangeCard.innerHTML = `
        <div class="settings-subcards settings-subcards-compact">
          <div class="settings-subcard">
            <div class="settings-tag">Stammdaten</div>
            <h3>Fahrer und Autos austauschen</h3>
            <div class="muted settings-subcopy">Exportiert und importiert nur Stammdaten. Bestehende Datensaetze werden nicht ueberschrieben; doppelte Chip-IDs werden uebersprungen.</div>
            <div class="settings-actions">
              <button class="btn" id="btnExportMaster">Stammdaten exportieren</button>
            </div>
            <div class="hr"></div>
            <div class="field" style="margin-bottom:0">
              <label>Stammdaten-Datei</label>
              <input class="input settings-file-input" type="file" id="importFile" accept="application/json"/>
            </div>
            <label class="row settings-toggle" style="margin-top:12px">
              <input type="checkbox" id="importAllowDupNames"/>
              <span>Duplikate nach Name erlauben</span>
            </label>
            <div class="settings-actions">
              <button class="btn" id="btnImportMaster">Stammdaten importieren</button>
            </div>
          </div>
          <div class="settings-note">
            <div class="settings-tag">Audio</div>
            <h3 style="margin:8px 0 0">Audio-DB separat</h3>
            <div class="muted settings-subcopy">Sounds liegen in IndexedDB und werden deshalb im Audio-Tab separat exportiert und importiert.</div>
          </div>
        </div>
      `;
    }

    const generalFormRow = el.querySelector('.settings-form-row');
    const baudField = el.querySelector('#baud')?.closest('.field');
    if(baudField){
      baudField.remove();
      if(generalFormRow) generalFormRow.style.gridTemplateColumns = '1fr';
    }

    const lapTimeCard = el.querySelector('#setLapTimeSource')?.closest('.settings-card');
    if(lapTimeCard) lapTimeCard.remove();

    const settingsStacks = el.querySelectorAll('.settings-stack');
    const dataExchangeCardNode = el.querySelector('#settingsDataExchangeCard');
    const backupCardNode = el.querySelector('#settingsBackupCard');
    const resetCardNode = el.querySelector('#btnResetAll')?.closest('.settings-card');
    if(settingsStacks.length >= 2 && dataExchangeCardNode && backupCardNode){
      settingsStacks[0].insertBefore(dataExchangeCardNode, resetCardNode || null);
      const rightSectionLabel = settingsStacks[1].querySelector('.settings-sectionlabel');
      if(rightSectionLabel) rightSectionLabel.textContent = 'Integrationen';
    }

    el.querySelector('#saveSettings').onclick=()=>{
      saveSettingsFromForm({ notify:true, log:true });
    };

    const btnRaceDayWebhookTest = el.querySelector('#btnRaceDayWebhookTest');
    if(btnRaceDayWebhookTest){
      btnRaceDayWebhookTest.onclick = async ()=>{
        const draft = readSettingsForm();
        const webhookUrl = draft.discordRaceDayWebhook;
        const rd = getActiveRaceDay();
        if(!webhookUrl){ toast('Discord','Bitte zuerst einen Renntag-Webhook eintragen.','err'); return; }
        if(!rd){ toast('Discord','Kein aktiver Renntag vorhanden.','err'); return; }
        commitSettingsDraft(draft);
        btnRaceDayWebhookTest.disabled = true;
        const prev = btnRaceDayWebhookTest.textContent;
        btnRaceDayWebhookTest.textContent = 'Sende Test...';
        try{
          await sendRaceDayWebhook(rd.id);
          toast('Discord','Renntag erfolgreich gesendet.','ok');
          logLine('Renntag Test erfolgreich gesendet');
        }catch(err){
          if(err?.queued){
            toast('Discord','Renntag-Test in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Renntag Test');
          }else{
            toast('Discord','Renntag-Test fehlgeschlagen.','err');
            logLine('Renntag Test Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnRaceDayWebhookTest.disabled = false;
          btnRaceDayWebhookTest.textContent = prev;
        }
      };
    }
    const btnSeasonWebhookTest = el.querySelector('#btnSeasonWebhookTest');
    if(btnSeasonWebhookTest){
      btnSeasonWebhookTest.onclick = async ()=>{
        const draft = readSettingsForm();
        const webhookUrl = draft.discordSeasonWebhook;
        const season = getActiveSeason();
        if(!webhookUrl){ toast('Discord','Bitte zuerst einen Saison-Webhook eintragen.','err'); return; }
        if(!season){ toast('Discord','Keine aktive Saison vorhanden.','err'); return; }
        commitSettingsDraft(draft);
        btnSeasonWebhookTest.disabled = true;
        const prev = btnSeasonWebhookTest.textContent;
        btnSeasonWebhookTest.textContent = 'Sende Test...';
        try{
          await sendSeasonWebhook(season.id);
          toast('Discord','Saison erfolgreich gesendet.','ok');
          logLine('Saison Test erfolgreich gesendet');
        }catch(err){
          if(err?.queued){
            toast('Discord','Saison-Test in Warteschlange. Versand folgt automatisch.','warn');
            logLine('Discord Queue aktiv: Saison Test');
          }else{
            toast('Discord','Saison-Test fehlgeschlagen.','err');
            logLine('Saison Test Fehler: ' + String(err?.message || err || 'Unbekannter Fehler'));
          }
        }finally{
          btnSeasonWebhookTest.disabled = false;
          btnSeasonWebhookTest.textContent = prev;
        }
      };
    }

    const btnBackup = el.querySelector('#btnBackup');
    if(btnBackup) btnBackup.onclick = ()=>{
      exportAll();
    };

    const btnExportMaster = el.querySelector('#btnExportMaster');
    if(btnExportMaster) btnExportMaster.onclick = ()=>{
      exportStammdaten();
    };

    const btnImportMaster = el.querySelector('#btnImportMaster');
    if(btnImportMaster) btnImportMaster.onclick = async ()=>{
      const importFile = el.querySelector('#importFile');
      const file = importFile?.files?.[0];
      if(!file){ toast('Import','Bitte Datei auswaehlen.','warn'); return; }
      try{
        const allowDup = !!el.querySelector('#importAllowDupNames')?.checked;
        await importStammdatenFile(file, allowDup);
      }catch(err){
        const code = String(err?.message || err || '');
        const msg = code==='import_invalid_masterdata_file'
          ? 'Ungueltige Stammdaten-Datei.'
          : 'Konnte Datei nicht importieren.';
        toast('Import', msg, 'err');
        logLine('Import Fehler: ' + code);
      } finally {
        if(importFile) importFile.value = '';
      }
    };


    el.querySelector('#btnResetAll').onclick=async ()=>{
      await clearAllStoredData();
      toast('Reset','Alles gelöscht.','ok');
      logLine('Reset: Alles gelöscht');
      renderAll();
    };

    el.querySelector('#btnResetRaceData').onclick=async ()=>{
      await clearRaceDataOnly();
      toast('Reset','Renndaten gelöscht.','ok');
      logLine('Reset: Nur Renndaten gelöscht');
      renderAll();
    };

    el.querySelector('#btnResetAudioDb').onclick=async ()=>{
      await clearAudioDbAndAssignments();
      toast('Reset','Audio-DB gelöscht.','ok');
      logLine('Reset: Nur Audio-DB gelöscht');
      renderAll();
    };

    el.querySelector('#fileRestore').onchange=async (ev)=>{
      const f = ev.target.files && ev.target.files[0];
      if(!f) return;
      try{
        await restoreStateFromFile(f);
        toast('Restore','Backup importiert.','ok');
        logLine('Restore import erfolgreich');
      }catch(e){
        const code = String(e?.message || e || '');
        const msg = code==='restore_received_masterdata_export'
          ? 'Das ist ein Stammdaten-Export. Bitte unten bei Stammdaten importieren.'
          : (code==='restore_received_audio_export'
            ? 'Das ist ein Audio-DB-Export. Bitte im Audio-Tab importieren.'
            : 'Ungueltige Backup-Datei.');
        toast('Restore', msg, 'err');
        logLine('Restore Fehler: ' + code);
      } finally { ev.target.value=''; }
    };

  }

    let lastDashRenderTs = 0;
// --------------------- Timer tick ---------------------
  
  function computeTimerDisplay(){
    // Default: elapsed session time
    let ms = sessionElapsedMs();
    let prefix = '';

    if(state.modes.activeMode==='loop' && state.loopRuntime && state.loopRuntime.phase){
      const ph = state.loopRuntime.phase;
      if(ph==='race'){
        const limitMs = Math.max(0.01, Number(state.modes.loop.raceMin||0))*60_000;
        const f = state.session.finish;
        if(f?.pending && f.type==='time'){
          const base = (f.firstFinishTs && f.firstFinishTs>0) ? f.firstFinishTs : getTimelineNowMs();
          ms = Math.max(0, getTimelineNowMs() - base);
          prefix = 'ÜBERZEIT +';
        } else {
          const elapsed = Math.max(0, getTimelineNowMs() - (state.loopRuntime.phaseStartedAt || getTimelineNowMs()));
          ms = Math.max(0, limitMs - elapsed);
          prefix = '';
        }
      } else {
        ms = state.loopRuntime.phaseEndsAt ? Math.max(0, state.loopRuntime.phaseEndsAt - getTimelineNowMs()) : 0;
        prefix = '';
      }
    }

    if(!isFreeDrivingMode() && state.modes.activeMode==='single' && (state.modes.single?.finishMode||'none')==='time'){
      const limitMs = Math.max(1, (state.modes.single.timeLimitSec||180)) * 1000;
      const f = state.session.finish;
      if(f?.pending && f.type==='time'){
        const base = (f.firstFinishTs && f.firstFinishTs>0) ? f.firstFinishTs : getTimelineNowMs();
        ms = Math.max(0, getTimelineNowMs() - base);
        prefix = 'ÜBERZEIT +';
      } else {
        ms = Math.max(0, limitMs - sessionElapsedMs());
        prefix = '';
      }
    }

    if(state.modes.activeMode==='team' && (state.modes.team?.finishMode||'none')==='time'){
      const limitMs = Math.max(1, (state.modes.team.timeLimitSec||180)) * 1000;
      const f = state.session.finish;
      if(f?.pending && f.type==='time'){
        const base = (f.firstFinishTs && f.firstFinishTs>0) ? f.firstFinishTs : getTimelineNowMs();
        ms = Math.max(0, getTimelineNowMs() - base);
        prefix = 'ÜBERZEIT +';
      } else {
        ms = Math.max(0, limitMs - sessionElapsedMs());
        prefix = '';
      }
    }

    if(state.modes.activeMode==='endurance'){
      const liveRace = state.session.currentRaceId ? (getActiveRaceDay()?.races?.find(r=>r.id===state.session.currentRaceId) || null) : null;
      const limitMs = Math.max(1, Number(liveRace?.enduranceDurationMin || state.modes.endurance?.durationMin || 30)) * 60_000;
      const f = state.session.finish;
      if(f?.pending && f.type==='time'){
        const base = (f.firstFinishTs && f.firstFinishTs>0) ? f.firstFinishTs : getTimelineNowMs();
        ms = Math.max(0, getTimelineNowMs() - base);
        prefix = 'ÜBERZEIT +';
      } else if(state.session.state==='RUNNING'){
        ms = Math.max(0, limitMs - sessionElapsedMs());
        prefix = '';
      }
    }

    return prefix + msToTime(ms, 0);
  }

function tick(){
    const t = document.getElementById('scTimer');
    if(t){
      t.textContent = computeTimerDisplay();

    // Live-refresh Dashboard without requiring a tab click
    if(state.ui.activeTab==='Dashboard'){
      const nowTs = now();
      if(nowTs - lastDashRenderTs > 250){
        lastDashRenderTs = nowTs;
        try{ renderDashboard(); }catch{}
      }
    }

    }
    
    // Race countdown / finish announcements
    if(state.session.state==='RUNNING'){
      ensureRaceAnnounceRuntime();
      let remainingSec = null;
      let activeRaceId = state.session.currentRaceId || '';

      if(!isFreeDrivingMode() && state.modes.activeMode==='single' && (state.modes.single?.finishMode||'none')==='time'){
        const limitMs = Math.max(1, (state.modes.single.timeLimitSec||180)) * 1000;
        if(!(state.session.finish?.pending)){
          remainingSec = Math.ceil(Math.max(0, limitMs - sessionElapsedMs()) / 1000);
        } else if(!state.session.announce.timeExpiredSaid && state.audio?.enabled && state.audio?.sayTimeExpired){
          queueSpeak('Zeit abgelaufen');
          state.session.announce.timeExpiredSaid = true;
          saveState();
        }
      } else if(state.modes.activeMode==='loop' && (state.loopRuntime?.phase==='race' || state.loopRuntime?.phase==='setup')){
        const limitMs = Math.max(0.01, Number(state.modes.loop.raceMin||0))*60_000;
        const elapsed = Math.max(0, getTimelineNowMs() - (state.loopRuntime.phaseStartedAt || getTimelineNowMs()));
        if(!(state.session.finish?.pending)){
          remainingSec = Math.ceil(Math.max(0, limitMs - elapsed) / 1000);
        } else if(!state.session.announce.timeExpiredSaid && state.audio?.enabled && state.audio?.sayTimeExpired){
          queueSpeak('Zeit abgelaufen');
          state.session.announce.timeExpiredSaid = true;
          saveState();
        }
      }

      if(remainingSec!=null){
        const listTimes = (state.audio?.restAnnouncementTimes||[]).filter(x=>Number.isFinite(x));
        const maxSec = (state.modes.activeMode==='loop' && state.loopRuntime?.phase==='setup' && state.loopRuntime?.phaseTotalSec) ? state.loopRuntime.phaseTotalSec : null;
        for(const tSec of listTimes){
          const key = String(activeRaceId)+':'+String(tSec);
          if(remainingSec===tSec && !state.session.announce.restSaidKeys[key]){
            const totalSec = (state.modes.activeMode==='loop' && state.loopRuntime?.phaseTotalSec) ? state.loopRuntime.phaseTotalSec : null;
            if(maxSec!=null && tSec>maxSec) continue;
            if(totalSec!=null && tSec===totalSec){
              state.session.announce.restSaidKeys[key] = true;
              continue;
            }
            speakRaceRemaining(tSec);
            state.session.announce.restSaidKeys[key] = true;
            saveState();
            break;
          }
        }
      }
    }

sendPresenterSnapshot();
    loopTick();
    singleTick();
    teamTick();
    enduranceTick();
    // also enforce finish window for other modes (if started)
    finishTick();
    requestAnimationFrame(tick);
  }

  
  let backgroundUiTs = 0;
  function backgroundUiRefresh(force=false){
    const nowTs = now();
    if(!force && (nowTs - backgroundUiTs) < 250) return;
    backgroundUiTs = nowTs;
    try{
      const t = document.getElementById('scTimer');
      if(t) t.textContent = computeTimerDisplay();
    }catch{}
    try{ renderSessionControl(); }catch{}
    try{ if(state.ui.activeTab==='Dashboard') renderDashboard(); }catch{}
    try{ sendPresenterSnapshot(false); }catch{}
  }

  setInterval(()=>{
    backgroundUiRefresh(false);
  }, 250);

  setInterval(()=>{
    processDiscordQueue(false).catch(()=>{});
  }, 30000);

  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden){
      backgroundUiRefresh(true);
      processDiscordQueue(false).catch(()=>{});
    }
  });
  window.addEventListener('focus', ()=>{
    backgroundUiRefresh(true);
    processDiscordQueue(false).catch(()=>{});
  });
  window.addEventListener('online', ()=>scheduleDiscordQueueProcessing(250));

// --------------------- Wire buttons ---------------------
  function wire(){
    document.getElementById('btnStart').onclick=sessionStart;
    document.getElementById('btnStop').onclick=sessionStop;
    document.getElementById('btnPause').onclick=sessionPause;
    document.getElementById('btnResume').onclick=sessionResume;


    const scUse = document.getElementById('scUseAmpel');
    if(scUse) scUse.onchange = ()=>{ state.settings.useAmpel = scUse.checked; saveState(); toast('Ampel', scUse.checked?'Ampel aktiv.':'Ampel aus.','ok'); };

    const btnFreeDrivingOn = document.getElementById('btnFreeDrivingOn');
    if(btnFreeDrivingOn) btnFreeDrivingOn.onclick = async ()=>{
      if(state.session.state !== 'IDLE') return;
      state.ui.freeDrivingEnabled = true;
      saveState();
      renderSessionControl();
      sendPresenterSnapshot(true);
      await sessionStart();
    };

    const btnFreeDrivingOff = document.getElementById('btnFreeDrivingOff');
    if(btnFreeDrivingOff) btnFreeDrivingOff.onclick = ()=>{
      if(state.session.isFreeDriving || state.ui.freeDrivingEnabled){
        sessionStop();
        toast('Session', 'Freies Fahren aus.', 'ok');
      }
    };

    document.getElementById('btnUsb').onclick=async ()=>{
      if(state.usb.connected) await usbDisconnect(); else await usbConnect();
    };

    const btnBt = document.getElementById('btnBt');
    if(btnBt) btnBt.onclick=async ()=>{
      if(state.ble.connected) await bleDisconnect(); else await bleConnect();
    };

    document.getElementById('btnClearLog').onclick=()=>{
      state.usb.lastLines=[]; state.ble.lastLines=[]; saveState();
      const el=document.getElementById('runLog'); if(el) el.textContent='';
      toast('Log','Geleert.','ok');
    };

    const toggleLogPane = ()=>{
      ui.logCollapsed = !ui.logCollapsed;
      applyLogUi();
    };
    document.getElementById('btnToggleLog').onclick=toggleLogPane;
    const btnToggleLogDock = document.getElementById('btnToggleLogDock');
    if(btnToggleLogDock) btnToggleLogDock.onclick = toggleLogPane;
    const btnPresenter = document.getElementById('btnPresenter');
    if(btnPresenter) btnPresenter.onclick = ()=>openPresenterWindow();

    wireLogResizer();
  
}

  // --------------------- Render all ---------------------
  function renderAll(){
    ensureAutoEntities(state);
    const safeRender = (name, fn)=>{
      try{
        fn();
      }catch(err){
        logLine('Render Fehler [' + name + ']: ' + String(err?.message || err || 'Unbekannter Fehler'));
        try{ console.error('Render Fehler [' + name + ']', err); }catch{}
      }
    };
    safeRender('Header', renderHeader);
    safeRender('TopMenu', renderTopMenu);
    safeRender('ActivePage', showActivePage);
    safeRender('SessionControl', renderSessionControl);
    try{ sendPresenterSnapshot(true); }catch{}
    safeRender('Dashboard', renderDashboard);
    safeRender('Einzellaeufe', renderEinzellaeufe);
    safeRender('Teamrennen', renderTeamrennen);
    safeRender('Dauerschleife', renderDauerschleife);
    safeRender('Langstrecke', renderLangstrecke);
    safeRender('Stammdaten', renderStammdaten);
    safeRender('Strecken', renderStrecken);
    safeRender('Renntag', renderRenntag);
    safeRender('RenntagAuswertung', renderRenntagAuswertung);
    safeRender('Saison', renderSaison);
    safeRender('SaisonAuswertung', renderSaisonAuswertung);
    safeRender('Audio', renderAudio);
    safeRender('Einstellungen', renderEinstellungen);

    const logEl=document.getElementById('runLog');
    if(logEl) logEl.textContent = [...(state.ble.lastLines||[]), ...(state.usb.lastLines||[])].slice(0,500).join('\n');
    applyLogUi();
  }

  // voices update
  if('speechSynthesis' in window){
    speechSynthesis.onvoiceschanged = ()=>{ if(state.ui.activeTab==='Audio') renderAudio(); };
    // Renntag: Session löschen (delegated, robust gegen Re-Renders)
    document.addEventListener('click', (ev)=>{
      const t = ev.target;
      if(!t || !t.id) return;
      if(t.id==='raceDelete'){
        try{
          const rd = getActiveRaceDay();
          const selectedRaceId = state.ui.selectedRaceId || '';
          if(!rd || !selectedRaceId){
            toast('Renntag','Bitte zuerst eine Session auswählen.','warn');
            return;
          }
          rd.races = (rd.races||[]).filter(r=>r.id!==selectedRaceId);
          state.session.laps = state.session.laps.filter(l=>l.raceId!==selectedRaceId);
          state.ui.selectedRaceId = '';
          state.ui.selectedDriverId = '';
          saveState();
          toast('Renntag','Session gelöscht.','ok');
          renderRenntag(); renderDashboard();
        }catch(e){
          toast('Renntag','Fehler beim Löschen.','err');
          logLine('Renntag delete error: '+(e?.message||e));
        }
      }
      if(t.id==='raceDeleteAll'){
        try{
          const rd = getActiveRaceDay();
          if(!rd){
            toast('Renntag','Kein Renntag aktiv.','warn');
            return;
          }
          const ids = new Set((rd.races||[]).map(r=>r.id));
          rd.races = [];
          state.session.laps = state.session.laps.filter(l=>!ids.has(l.raceId));
          state.ui.selectedRaceId = '';
          state.ui.selectedDriverId = '';
          saveState();
          toast('Renntag','Alle Sessions gelöscht.','ok');
          renderRenntag(); renderDashboard();
        }catch(e){
          toast('Renntag','Fehler beim Löschen.','err');
          logLine('Renntag delete all error: '+(e?.message||e));
        }
      }
    }, true);
    // raceDelete delegated

    // Legacy Import/Export path intentionally disabled; handled in renderEinstellungen.
    if(false) document.addEventListener('click', async (ev)=>{
      const t = ev.target;
      if(!t || !t.id) return;
      // handled directly in renderEinstellungen / wire to avoid duplicate exports/imports
      return;

      if(t.id==='btnExportMaster'){
        try{ exportStammdaten(); }catch(e){ toast('Export','Fehler.','err'); logLine('Export error: '+(e?.message||e)); }
      }
      if(t.id==='btnExportAll'){
        try{ exportAll(); }catch(e){ toast('Export','Fehler.','err'); logLine('Export error: '+(e?.message||e)); }
      }
      if(t.id==='btnImportMaster'){
        try{
          const file = document.getElementById('importFile')?.files?.[0];
          if(!file){ toast('Import','Bitte Datei auswählen.','warn'); return; }
          const txt = await file.text();
          const obj = JSON.parse(txt);
          const allowDup = !!document.getElementById('importAllowDupNames')?.checked;
          importStammdatenFromJson(obj, allowDup);
        }catch(e){
          toast('Import','Konnte Datei nicht importieren.','err');
          logLine('Import error: '+(e?.message||e));
        }
      }
    }, true);
    // Import/Export delegated

  }

  // init
  applyLogUi();
  installUsbConnectDisconnectListeners();
  usbProbeOnLoad();
  state.ble.available = ('bluetooth' in navigator);
  setBleUi(false);
  window.addEventListener('resize', applyLogUi);
  await hydrateExternalAppData();
  renderAll();
  wire();
  ensureBuiltInDefaultDriverSound().then(()=>{ try{ renderAudio(); }catch{} });
  scheduleDiscordQueueProcessing(2000);
  requestAnimationFrame(tick);
  logLine('Zeitnahme 2.0 geladen (' + BUILD + ')');
  toast('Build', 'Geladen: ' + BUILD, 'ok');
  bleAutoReconnectOnLoad();
})();
