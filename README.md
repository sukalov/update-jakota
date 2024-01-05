# update jakota

Commands for updating and managing data for [JaKoTa index](https://jakotaindex.com)

## installation

First of all, [Bun](https://bun.sh) needs to be pre-installed. Then, to install dependencies run:

```bash
bun install
```

## actions

| command | runs | description | args |
| --- | --- | --- | --- |
| `bun start` | `bun run index.ts --zone=US` | Basic update of the indicies getting all prices from [EOD](https://eodhd.com/) | `--zone` has two values: **US** for weekend is days 6 and 0 of the week. **Europe** means weekend is days 5 and 6. Default value is **US** |
| `bun repeat` | `bun run repeat.ts --zone=US` | Running the update using prices from the database collected on initial update (`bun start`) | `--zone` same as in `bun start` |
| `bun splits` | `bun run lib/splits.ts` | Collects splits data from [EOD](https://eodhd.com/), happened since particular date. Those companies with recent splits are written down to a separate csv file, where a new column _shares_modern_ is added. This is EOD's value for actuals shares outstanding | `--start` is date, from which we start counting splits. date format: _YYYY-MM-DD_. No default value |
| `bun new-adjustments` | `bun run lib/new-adjustments.ts` | Creates new adjustments for all indicies with given date. It must be preceded with `bun start` command which updates all prices in the database | `--date` is an obligatory arguement with no default value. Must be passed in _YYYY-MM-DD_ |