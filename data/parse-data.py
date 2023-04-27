import pandas as pd

FIELD_SEPARATOR = "@@@"


def main():
    data = pd.read_csv("./clean_books.csv")

    data["ISBN-string"] = data["ISBN"].astype("string")
    data["numOfPage"] = data["numOfPage"].fillna(0)

    data["numOfPage-string"] = data["numOfPage"].astype("int").astype("string")
    data["published_year-string"] = data["published_year"].astype("string")

    data["combined-key"] = (
        data["ISBN"].astype("string").str.cat(data["name"], sep=FIELD_SEPARATOR)
    )

    data["basic"] = data["ISBN-string"].str.cat(
        data[["name", "published_year-string", "coverUrl"]],
        sep=FIELD_SEPARATOR,
    )

    data["details"] = data["numOfPage-string"].str.cat(
        data[["authors", "sellPrice"]], sep=FIELD_SEPARATOR
    )

    data['parsedSellPrice'] = data['sellPrice'].str.replace(',', '').str.pad(width=10, fillchar='0')

    data[["combined-key", "basic", "details", "parsedSellPrice"]].to_csv(
        "./books_hbase.csv", header=False, index=False, sep="|"
    )


if __name__ == "__main__":
    main()
