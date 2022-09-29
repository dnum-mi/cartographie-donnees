from app.search.utils import remove_accent


def test_remove_accent_works_for_strings():
    assert remove_accent('Çâêîôûéëïüàèù') == 'caeioueeiuaeu'


def test_remove_accent_works_for_string_lists():
    assert remove_accent(['Çâêîôûéëïüàèù', 'éà']) == ['caeioueeiuaeu', 'ea']


def test_remove_accent_works_for_non_strings():
    assert remove_accent(1) == 1
    assert remove_accent([1]) == [1]
