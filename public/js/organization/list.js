$(document).ready(function() {
  $("#newBtn").click(function() {
    window.location.href = "/admin/organization/new";
  });

  $(".js-org .js-viewBtn").click(function() {
    var id = $(this).parents(".js-org").data("orgId");
    window.location.href = "/admin/organization/" + id;
  });

  $(".js-org .js-editBtn").click(function() {
    var id = $(this).parents(".js-org").data("orgId");
    window.location.href = "/admin/organization/" + id + "/edit";
  });

  $(".js-org .js-delBtn").click(function() {
    if (confirm("Are you sure to delete this organization?")) {
      var id = $(this).parents(".js-org").data("orgId");
      $.post('/admin/organization/' + id, {_method: 'delete'}, function(result) {
        if (result.success) {
          window.location.href = "/admin/organization";
        } else {
          alert("delete failed");
        }
      });
    }
  });
});